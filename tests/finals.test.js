import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {questions} from '../src/data/questions.js';
import {archiveQuestions} from '../src/data/archive.js';
import {revisions} from '../src/data/question-revisions.js';
import {chapters} from '../src/data/chapters.js';
import {createSession,confirmCurrent,setDraft,recordItem,finishSession,recommend} from '../src/logic/session.js';
import {freshProgress,validateProgress} from '../src/logic/storage.js';
import {scopeProgress,parkArchiveSession,isFinalsSession,studyStatus,resetFinalsProgress} from '../src/logic/finals.js';
import {renderStart,renderLibrary,renderChapter,renderChapters,renderResults} from '../src/views/screens.js';
const bank=new Map([...questions,...archiveQuestions].map(q=>[q.id,q]));
const manifest=JSON.parse(await readFile(new URL('./fixtures/finals-answers.json',import.meta.url),'utf8'));
test('audit preserves all 171 IDs, question types, answer indexes and correct choices for saved progress',()=>{
 assert.equal(Object.keys(revisions).length,100);
 for(const original of manifest){const q=bank.get(original.id);assert.ok(q);assert.equal(q.type,original.type);assert.equal(q.answer,original.answer);assert.equal(q.choices[q.answer],original.correctChoice);}
 for(const q of questions.filter(q=>q.type==='true-false'&&q.answer===1)){assert.ok(revisions[q.id]?.explanation);assert.ok(q.explanation.split(' ').length>=25);}
});
test('old mixed active session is parked intact while finals progress and archive history remain intact',()=>{
 const p=freshProgress(),archive=archiveQuestions[0];
 p.active=createSession([archive,questions[0]],{size:2,seed:'mixed-old'});setDraft(p.active,0);p.active.items[0].flag=true;const old=structuredClone(p.active);
 p.first[archive.id]={correct:false,status:'answered',at:1};p.latest[archive.id]={correct:false,status:'answered',at:1};p.flags=[archive.id];
 assert.equal(parkArchiveSession(p,bank),true);assert.equal(p.active,null);assert.deepEqual(p.archivedSessions,[old]);assert.ok(p.first[archive.id]);
 assert.deepEqual(validateProgress({version:2,...p},bank),p);assert.equal(parkArchiveSession(p,bank),false);
 const visible=scopeProgress(p,bank);assert.deepEqual(visible.first,{});assert.deepEqual(visible.latest,{});assert.deepEqual(visible.flags,[]);
});
test('existing finals resume preserves draft, mapping, index, deadline, flags and session ID',()=>{
 const p=freshProgress();p.active=createSession(questions,{size:10,minutes:15});setDraft(p.active,0);p.active.index=0;p.active.items[0].flag=true;const original=structuredClone(p.active);
 assert.equal(parkArchiveSession(p,bank),false);assert.deepEqual(scopeProgress(p,bank).active,original);assert.deepEqual(validateProgress({version:2,...p},bank).active,original);
});
test('chapter practiced count includes unique scored answers, excluding drafts, skips and unfinished mocks',()=>{
 const q=questions[0],p=freshProgress();p.active=createSession([q]);setDraft(p.active,q.answer);assert.equal(studyStatus([q],p).text,'Not started · 1 question');
 confirmCurrent(p.active);recordItem(p,p.active,p.active.items[0],bank);assert.equal(studyStatus([q],p).text,'1 correct');finishSession(p,bank);
 p.active=createSession([q]);setDraft(p.active,q.answer);confirmCurrent(p.active);recordItem(p,p.active,p.active.items[0],bank);assert.equal(studyStatus([q],p).practiced,1);
 const untouched=freshProgress();untouched.active=createSession([q],{mock:true});setDraft(untouched.active,q.answer);confirmCurrent(untouched.active);assert.equal(studyStatus([q],untouched).practiced,0);
 untouched.active.items[0].checked=false;untouched.active.items[0].pick=null;untouched.active.items[0].skipped=true;finishSession(untouched,bank);assert.equal(studyStatus([q],untouched).practiced,0);assert.equal(studyStatus([q],untouched).missed,0);assert.deepEqual(untouched.latest,{});assert.deepEqual(untouched.first,{});
});
test('balanced practice prefers unseen items within each chapter and caps sparse topic pools',()=>{
 const unseen=new Set(chapters.flatMap(ch=>questions.filter(q=>q.chapter===ch.number).slice(0,2).map(q=>q.id)));
 const s=createSession(questions,{size:10,seen:new Set(questions.filter(q=>!unseen.has(q.id)).map(q=>q.id))});
 assert.ok(s.items.every(i=>unseen.has(i.id)));assert.equal(new Set(s.items.map(i=>i.id)).size,10);
 const dma=questions.filter(q=>q.chapter===9&&q.topic==='DMA');const focused=createSession(dma,{size:20});assert.equal(focused.items.length,dma.length);assert.ok(focused.items.every(i=>dma.some(q=>q.id===i.id)));
});
test('one primary decision follows resume, missed, mixed priority; chapter opens topic actions',()=>{
 const p=freshProgress();let html=renderLibrary(chapters,questions,p);assert.equal((html.match(/class="button primary[ "]/g)||[]).length,1);assert.match(html,/class="button primary large" data-action="today"/);
 p.latest[questions[0].id]={correct:false,status:'answered',at:1};html=renderLibrary(chapters,questions,p);assert.match(html,/class="button primary large" data-action="today"/);assert.ok(html.includes('Fix 1 miss'));
 p.active=createSession(questions,{size:10});html=renderLibrary(chapters,questions,p);assert.match(html,/class="button primary large" data-action="resume"/);assert.match(renderStart(p),/Resume session/);assert.ok(!renderStart(p).includes('Start studying'));
 const chapter=renderChapter(chapters[2],questions,p);assert.ok(chapter.includes('9:DMA'));assert.ok(chapter.includes('Practice chapter · 10'));assert.equal((chapter.match(/class="button primary[ "]/g)||[]).length,1);
});
test('recommendation gives session-specific evidence and fresh topic questions, then misses fallback',()=>{
 const dma=questions.filter(q=>q.chapter===9&&q.topic==='DMA');const entries=dma.slice(0,5).map((question,i)=>({question,correct:i>=3,pick:i>=3?question.answer:(question.answer+1)%question.choices.length,status:'answered'}));
 const rec=recommend(entries,questions);assert.equal(rec.missed,3);assert.equal(rec.total,5);assert.ok(rec.pool.every(q=>q.chapter===9&&q.topic==='DMA'));assert.match(renderResults({entries,correct:2,total:5,unanswered:3,skipped:0},rec),/You missed 3 of 5 DMA questions/);
 const fallback=recommend(entries,questions,new Set(dma.map(q=>q.id)));assert.equal(fallback.fresh,false);assert.deepEqual(fallback.pool,dma.slice(0,3));
});
test('archive-only history and aggregate counters cannot leak into visible finals progress or results',()=>{
 const p=freshProgress(),archive=archiveQuestions[0];p.active=createSession([archive]);setDraft(p.active,1-archive.answer);confirmCurrent(p.active);finishSession(p,bank);p.retries={total:999,correct:999};
 const visible=scopeProgress(p,bank),html=renderLibrary(chapters,questions,visible);assert.equal(visible.history.length,0);assert.ok(!html.includes('999'));assert.ok(!html.includes('Midterm'));assert.ok(!html.includes(archive.topic));assert.equal((renderChapters(chapters,questions,visible).match(/data-action="chapter"/g)||[]).length,5);
 assert.equal(isFinalsSession(createSession([archive]),bank),false);
});

test('finals reset preserves archive records, flags, history and parked attempts',()=>{
 const p=freshProgress(),archive=archiveQuestions[0];p.first[archive.id]={correct:false,status:'answered',at:1};p.latest[archive.id]={correct:false,status:'answered',at:1};p.first[questions[0].id]={correct:true,status:'answered',at:2};p.latest[questions[0].id]={correct:true,status:'answered',at:2};p.flags=[archive.id,questions[0].id];
 p.active=createSession([archive]);setDraft(p.active,archive.answer);confirmCurrent(p.active);finishSession(p,bank);const oldHistory=structuredClone(p.history);
 p.active=createSession([archive,questions[0]],{size:2});const mixed=structuredClone(p.active);
 const reset=resetFinalsProgress(p,bank);assert.deepEqual(reset.first[archive.id],p.first[archive.id]);assert.deepEqual(reset.latest[archive.id],p.latest[archive.id]);assert.ok(!reset.first[questions[0].id]);assert.deepEqual(reset.flags,[archive.id]);assert.deepEqual(reset.history,oldHistory);assert.deepEqual(reset.archivedSessions,[mixed]);assert.deepEqual(validateProgress({version:2,...reset},bank),reset);
});
