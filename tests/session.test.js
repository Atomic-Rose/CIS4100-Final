import assert from 'node:assert/strict';
import {test} from 'node:test';
import {questions} from '../src/data/questions.js';
import {archiveQuestions} from '../src/data/archive.js';
import {balancedSample,createSession,setDraft,confirmCurrent,navigate,score,recommend,recordItem,finishSession,savedMocks,mockOverlap,cramPool} from '../src/logic/session.js';
import {freshProgress,loadProgress,saveProgress,validateProgress,importLegacy,key} from '../src/logic/storage.js';
import {renderQuiz,renderLibrary,renderResults} from '../src/views/screens.js';
import {chapters} from '../src/data/chapters.js';
const all=[...questions,...archiveQuestions],bank=new Map(all.map(q=>[q.id,q]));
test('bank integrity: stable IDs, canonical zero, two formats, provenance and balanced T/F',()=>{
 assert.equal(questions.length,171);assert.equal(archiveQuestions.length,442);assert.equal(bank.size,all.length);
 assert.equal(new Set(all.map(q=>q.prompt)).size,all.length);
 for(const q of all){assert.match(q.id,new RegExp(`^C${q.chapter}-[0-9]+$`));assert.ok(q.topic&&q.explanation&&q.reference&&q.prompt);assert.equal(q.choices.length,q.type==='true-false'?2:4);assert.equal(new Set(q.choices).size,q.choices.length);assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<q.choices.length);if(q.type==='true-false')assert.deepEqual(q.choices,['True','False']);}
 for(let c=7;c<=11;c++){const pool=questions.filter(q=>q.chapter===c);assert.ok(pool.length>=32);const tf=pool.filter(q=>q.type==='true-false'),t=tf.filter(q=>q.answer===0).length;assert.ok(t/tf.length>=.35&&t/tf.length<=.65);assert.deepEqual(pool.slice(0,8).map(q=>q.id),Array.from({length:8},(_,i)=>`C${c}-${String(i+1).padStart(3,'0')}`));}
 assert.ok(questions.some(q=>q.answer===0));
});
test('balanced selection includes all pools without duplicates and handles sparse chapters',()=>{
 for(const n of [1,10,20,40,500]){const sample=balancedSample(questions,n);assert.equal(sample.length,Math.min(n,questions.length));assert.equal(new Set(sample.map(q=>q.id)).size,sample.length);if(n<=40){const counts=chapters.map(c=>sample.filter(q=>q.chapter===c.number).length);assert.ok(Math.max(...counts)-Math.min(...counts)<=1);}}
 const sparse=[...questions.filter(q=>q.chapter===7).slice(0,1),...questions.filter(q=>q.chapter===8).slice(0,15)];assert.equal(balancedSample(sparse,20).length,16);
 assert.equal(createSession([],{}),null);
});
test('seed reproduces question and answer order; mapping survives serialization',()=>{
 const a=createSession(questions,{size:20,seed:'exam-a'}),b=createSession(questions,{size:20,seed:'exam-a'});
 assert.deepEqual(a.items,b.items);assert.deepEqual(JSON.parse(JSON.stringify(a)).items,a.items);
 assert.notDeepEqual(a.items,createSession(questions,{size:20,seed:'exam-b'}).items);
 const mc=questions.find(q=>q.type==='multiple-choice'&&q.answer===0),s=createSession([mc],{seed:'zero'});setDraft(s,0);assert.equal(score(s,bank).correct,0);assert.ok(confirmCurrent(s));assert.equal(score(s,bank).correct,1);assert.equal(confirmCurrent(s),false);
});
test('draft selection survives skip/revisit navigation; checked practice is fixed',()=>{
 const s=createSession(questions,{size:3});setDraft(s,s.items[0].order[1]);const chosen=s.draft;navigate(s,1);navigate(s,0);assert.equal(s.draft,chosen);confirmCurrent(s);assert.equal(setDraft(s,s.items[0].order[0]),false);assert.equal(s.items[0].pick,chosen);
 s.items[1].skipped=true;const sc=score(s,bank);assert.equal(sc.unanswered,2);assert.equal(sc.skipped,1);assert.equal(sc.entries[2].status,'unanswered');
});
test('mock stays ungraded until finalization, supports edits, and preserves T/F order',()=>{
 const q=questions.find(q=>q.type==='true-false'),s=createSession([q],{mock:true});const p=freshProgress();p.active=s;
 assert.deepEqual(s.items[0].order,[0,1]);setDraft(s,1-q.answer);confirmCurrent(s);recordItem(p,s,s.items[0],bank);assert.deepEqual(p.first,{});
 setDraft(s,q.answer);const html=renderQuiz(s,q);assert.ok(!html.includes(q.explanation));assert.ok(!html.includes('Correct answer'));
 const r=finishSession(p,bank);assert.equal(r.correct,1);assert.equal(p.first[q.id].correct,true);assert.equal(finishSession(p,bank),null);assert.equal(p.history.length,1);
});
test('first attempts stay fixed, correct retries clear latest missed and repeated checks are idempotent',()=>{
 const q=questions[0],p=freshProgress();p.active=createSession([q]);setDraft(p.active,1-q.answer);confirmCurrent(p.active);recordItem(p,p.active,p.active.items[0],bank);recordItem(p,p.active,p.active.items[0],bank);finishSession(p,bank);
 assert.equal(p.retries.total,0);assert.equal(p.first[q.id].correct,false);
 p.active=createSession([q]);setDraft(p.active,q.answer);confirmCurrent(p.active);recordItem(p,p.active,p.active.items[0],bank);finishSession(p,bank);
 assert.equal(p.first[q.id].correct,false);assert.equal(p.latest[q.id].correct,true);assert.deepEqual(p.retries,{correct:1,total:1});
});
test('finalized skips and unanswered are distinct and tracked as first outcomes',()=>{
 const p=freshProgress();p.active=createSession(questions,{size:2});p.active.items[0].skipped=true;const ids=p.active.items.map(i=>i.id),r=finishSession(p,bank);assert.equal(r.unanswered,2);assert.equal(r.skipped,1);assert.equal(p.first[ids[0]].status,'skipped');assert.equal(p.first[ids[1]].status,'unanswered');
});
test('recommendation prefers globally unseen same-topic items and falls back to missed',()=>{
 const q=questions.find(q=>questions.filter(x=>x.chapter===q.chapter&&x.topic===q.topic).length>1),entries=[{question:q,pick:null,correct:false}];
 const fresh=recommend(entries,questions);assert.ok(fresh.fresh);assert.ok(fresh.pool.every(x=>x.id!==q.id&&x.topic===q.topic));const retry=recommend(entries,questions,new Set(questions.map(q=>q.id)));assert.equal(retry.fresh,false);assert.deepEqual(retry.pool,[q]);assert.equal(recommend([{...entries[0],correct:true}],questions),null);
});
test('six deterministic saved mocks are balanced and have measured zero overlap',()=>{
 const mocks=savedMocks(questions);assert.deepEqual(mocks,savedMocks(questions));assert.equal(mocks.length,6);for(const mock of mocks){assert.equal(mock.length,20);assert.equal(new Set(mock.map(q=>q.id)).size,20);for(let c=7;c<=11;c++)assert.equal(mock.filter(q=>q.chapter===c).length,4);}
 const overlap=mockOverlap(mocks);assert.equal(overlap.unique,120);assert.equal(overlap.reused,0);for(let a=0;a<6;a++)for(let b=0;b<6;b++)assert.equal(overlap.matrix[a][b],a===b?20:0);
 const small=savedMocks(questions.slice(0,3));assert.equal(small[0].length,3);assert.equal(mockOverlap(small).reused,15);
});
test('cram puts latest misses before unseen then correct items',()=>{
 const pool=questions.slice(0,3),latest={[pool[0].id]:{correct:true},[pool[1].id]:{correct:false}};assert.deepEqual(cramPool(pool,latest).map(q=>q.id),[pool[1].id,pool[2].id,pool[0].id]);
});
test('progress round trips with absolute deadline, flags, mappings and drafts',()=>{
 const p=freshProgress();p.active=createSession(questions,{size:4,minutes:5});p.active.items[0].flag=true;setDraft(p.active,0);const raw={version:2,...p};assert.deepEqual(validateProgress(raw,bank),p);assert.equal(p.active.deadline-p.active.started,300000);
 const invalid=structuredClone(raw);invalid.active.items[0].order[1]=invalid.active.items[0].order[0];assert.throws(()=>validateProgress(invalid,bank));
 const unknown=structuredClone(raw);unknown.active.items[0].id='C99-000';assert.throws(()=>validateProgress(unknown,bank));
 const duplicate=structuredClone(raw);duplicate.active.items[1]=duplicate.active.items[0];assert.throws(()=>validateProgress(duplicate,bank));
});
test('storage handles corruption and denied writes without overwriting the original',()=>{
 const original=Object.getOwnPropertyDescriptor(globalThis,'localStorage'),values=new Map();
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)}});
 try{const p=freshProgress();p.active=createSession(questions,{size:2});assert.ok(saveProgress(p));assert.deepEqual(loadProgress(bank),{progress:p,writable:true});values.set(key,'{broken');assert.equal(loadProgress(bank).writable,false);assert.equal(values.get(key),'{broken');
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}}});assert.equal(loadProgress(bank).writable,false);assert.equal(saveProgress(p),false);
 }finally{if(original)Object.defineProperty(globalThis,'localStorage',original);else delete globalThis.localStorage;}
});
test('starter v1 progress migrates without inventing first-attempt history',()=>{
 const original=Object.getOwnPropertyDescriptor(globalThis,'localStorage');Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:()=>JSON.stringify({version:1,active:null,latest:{'C7-001':false}})}});
 try{const {progress:p,writable}=loadProgress(bank);assert.ok(writable);assert.deepEqual(p.first,{});assert.equal(p.latest['C7-001'].correct,false);}finally{if(original)Object.defineProperty(globalThis,'localStorage',original);else delete globalThis.localStorage;}
});
test('legacy content IDs stay fixed; separate progress import preserves first and retry chronology',()=>{
 const q=archiveQuestions[0],old={version:1,active:null,flags:[],history:[true,false].map((correct,i)=>({id:`legacy-${i}`,name:'Legacy',feedback:'immediate',started:1,finished:20+i,ids:[q.id],responses:{[q.id]:{status:'answered',answer:correct?q.answer===0:q.answer!==0,at:10+i}}}))};
 const p=importLegacy(old,bank);assert.equal(p.first[q.id].correct,true);assert.equal(p.first[q.id].at,10);assert.equal(p.latest[q.id].correct,false);assert.equal(p.retries.total,1);
 assert.throws(()=>importLegacy({...old,active:{}},bank));assert.throws(()=>importLegacy({...old,version:9},bank));
});
test('views expose native controls, no-feedback mocks and expandable answer review',()=>{
 const s=createSession(questions,{size:1}),q=bank.get(s.items[0].id);let html=renderQuiz(s,q);assert.ok(html.includes('Check answer'));setDraft(s,q.answer);confirmCurrent(s);html=renderQuiz(s,q);assert.ok(html.includes(q.explanation));assert.ok(html.includes('Chapter '+q.chapter));
 const r=score(s,bank);assert.ok(renderResults(r,null).includes('<details>'));const library=renderLibrary(chapters,questions,freshProgress(),mockOverlap(savedMocks(questions)));assert.ok(library.includes('Session options'));assert.ok(library.includes('Exam coverage, timing, and format are unspecified'));
});
test('worked calculation answers are independently checked',()=>{
 const byId=new Map(questions.map(q=>[q.id,q]));
 function answer(id,value){const q=byId.get(id);assert.equal(q.choices[q.answer],value);}
 answer('C7-015',`${(2**18*2).toLocaleString('en-US')} bytes`);
 answer('C7-028',String(32-8-2*Math.log2(16)));
 answer('C8-014',String(70/(1e9/2e9)));
 answer('C8-016',String(5+8-1));
 answer('C8-024',`${Math.round(2+(1-.9)*50)} ns`);
 answer('C9-021',String(4096+512-1));
 answer('C9-027',`${16*50e6/8/1e6} MB/s`);
 answer('C10-016',`${(60000/7200/2).toFixed(2)} ms`);
 answer('C10-017',`${1/(100*200)*1e6} μs`);
 answer('C10-018',`${6+4+.5} ms`);
 answer('C10-019',`${120000*4000*4*512/1e9} GB`);
 answer('C10-024',String(2352-2048));
 answer('C10-027',String(100*50*4/8));
});
