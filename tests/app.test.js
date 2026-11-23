// Runs the actual offline application controller in an isolated DOM adapter.
// This checks orchestration and packaging; it does not replace real browser layout QA.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {questions} from '../src/data/questions.js';
import {archiveQuestions} from '../src/data/archive.js';
import {createSession,setDraft,confirmCurrent,finishSession} from '../src/logic/session.js';
import {freshProgress} from '../src/logic/storage.js';
const html=await readFile(new URL('../offline/SmartPrep.html',import.meta.url),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
function harness(saved=null,{blocked=false}={}){
 const events={},rootEvents={},dialogEvents={},values=new Map(saved?[['smartprep-finals-v1',saved]]:[]),intervals=[];
 const element=()=>({hidden:false,innerHTML:'',textContent:'',disabled:false,open:false,focus(){},setAttribute(k,v){this[k]=v;},addEventListener(){}});
 const root=element(),warning=element(),notice=element(),dialog=element(),heading=element(),feedback=element(),next=element(),flag=element(),navigator=element(),timer=element();
 const controls={'#scope':{value:'finals'},'#topic':{value:'',replaceChildren(){},add(){}},'#length':{value:'10'},'#mock-length':{value:'20'},'#minutes':{value:'0'}};
 const misc=new Map();
 root.addEventListener=(type,fn)=>rootEvents[type]=fn;
 root.querySelector=selector=>controls[selector]||({'h1':heading,'.feedback':feedback,'[data-action="next"]':next,'[data-action="flag"]':flag,'.navigator':navigator,'#timer':timer}[selector])||null;
 root.querySelectorAll=()=>[];
 dialog.addEventListener=(type,fn)=>dialogEvents[type]=fn;
 dialog.showModal=()=>{dialog.open=true};
 dialog.close=value=>{dialog.returnValue=value;dialog.open=false;dialogEvents.close?.()};
 const document={activeElement:null,body:{dataset:{}},querySelector(selector){return {'#main':root,'#storage-status':warning,'#notice':notice,'#confirm-dialog':dialog}[selector]||misc.get(selector)|| (misc.set(selector,element()),misc.get(selector));},addEventListener:(type,fn)=>events[type]=fn,createElement:()=>({click(){}})};
 const context=vm.createContext({document,window:{scrollTo(){}},structuredClone,console,Date,Math,Map,Set,Blob,URL,Option:function(text,value){this.text=text;this.value=value;},localStorage:{getItem(k){if(blocked)throw Error('blocked');return values.get(k)},setItem(k,v){if(blocked)throw Error('blocked');values.set(k,v);}},setInterval:fn=>intervals.push(fn),setTimeout:()=>0});
 vm.runInContext(script,context,{timeout:3000});
 const click=(action,value='')=>rootEvents.click({target:{closest:()=>({dataset:{action,value:String(value)},setAttribute(){},textContent:''})}});
 const key=(key)=>events.keydown({key,target:{closest:()=>null},preventDefault(){}});
 const importFile=async(raw,legacy=false)=>{
   rootEvents.change({target:{id:legacy?'import-legacy':'import-progress',files:[{size:100,text:async()=>typeof raw==='string'?raw:JSON.stringify(raw)}]}});
   await new Promise(setImmediate);
 };
 return {root,warning,notice,dialog,controls,values,intervals,click,key,importFile,confirm:()=>dialog.close('confirm'),cancel:()=>dialog.close('cancel'),state:()=>JSON.parse(values.get('smartprep-finals-v1'))};
}
test('offline file contains all local data and no runtime external dependencies',()=>{
 assert.ok(html.includes('C1-001'));assert.ok(html.includes('C11-'));assert.ok(!/<script[^>]+src=|<link[^>]+rel="stylesheet"/.test(html));assert.ok(!/\bimport\s*\{/.test(script));
});
test('actual app: Start, chapter, select, check, stable first result, continue, save and resume',()=>{
 const h=harness();assert.ok(h.root.innerHTML.includes('Start studying'));h.click('library');assert.ok(h.root.innerHTML.includes('Your next study session'));h.click('chapter',7);h.click('chapter-practice',7);let s=h.state().active;assert.equal(s.items.length,10);const q=questions.find(q=>q.id===s.items[0].id);h.click('pick',q.answer);assert.ok(!h.root.innerHTML.includes(q.explanation));h.click('next');assert.ok(h.root.innerHTML.includes(q.explanation));assert.equal(h.state().first[q.id].correct,true);h.click('next');assert.equal(h.state().active.index,1);h.click('pick',0);h.click('exit');assert.ok(h.root.innerHTML.includes('Resume session'));
 const resumed=harness(h.values.get('smartprep-finals-v1'));resumed.click('library');resumed.click('resume');assert.equal(resumed.state().active.index,1);assert.equal(resumed.state().active.draft,0);assert.ok(resumed.root.innerHTML.includes('aria-pressed="true"'));
});
test('actual app: skip/revisit, T/F and MC keyboard selection, mock edit and deferred reveal',()=>{
 const h=harness();h.click('library');h.click('mock');let s=h.state().active;assert.equal(s.items.length,20);h.click('skip');assert.equal(h.state().active.items[0].skipped,true);h.click('goto',0);s=h.state().active;let q=questions.find(q=>q.id===s.items[0].id);h.key(q.type==='true-false'?'t':'a');h.click('next');h.click('previous');h.click('pick',q.answer);h.click('next');assert.deepEqual(h.state().first,{});assert.ok(!h.root.innerHTML.includes('Correct answer'));h.click('submit');assert.ok(h.dialog.open);h.cancel();assert.ok(h.state().active);h.click('submit');h.confirm();assert.equal(h.state().active,null);assert.equal(h.state().history.length,1);assert.ok(h.root.innerHTML.includes('Your results'));h.click('retry');assert.equal(h.state().active.mock,false);
});
test('actual app: empty review is explained and replacement retains finished history',()=>{
 const h=harness();h.click('library');h.click('missed');assert.ok(h.notice.textContent.includes('No questions'));h.click('mixed');h.click('exit');h.click('mock');assert.ok(h.dialog.open);h.cancel();assert.equal(h.state().active.mock,false);h.click('mock');h.confirm();assert.equal(h.state().active.mock,true);assert.equal(h.state().history.length,1);assert.equal(h.state().history[0].reason,'ended early');
});
test('actual app: absolute deadline expires on reload including while confirmation is open',()=>{
 const h=harness();h.click('library');h.controls['#minutes'].value='5';h.click('mock');let p=h.state();p.active.deadline=Date.now()-1;p.active.started=p.active.deadline-300000;
 const expired=harness(JSON.stringify(p));assert.equal(expired.state().active,null);assert.ok(expired.root.innerHTML.includes('Timer expired'));assert.equal(expired.state().history[0].reason,'timer expired');
 const timed=harness();timed.click('library');timed.controls['#minutes'].value='5';timed.click('mock');timed.click('submit');assert.ok(timed.dialog.open);
 // Use an absolute future clock in this isolated process, then restore it immediately.
 const now=Date.now;try{Date.now=()=>now()+301000;timed.intervals[0]();}finally{Date.now=now;}
 assert.equal(timed.dialog.open,false);assert.equal(timed.state().history.length,1);assert.equal(timed.state().history[0].reason,'timer expired');
});
test('actual app: corrupt and blocked storage remain usable and original corruption stays intact',()=>{
 const corrupt=harness('{broken');assert.equal(corrupt.warning.hidden,false);corrupt.click('library');corrupt.click('mixed');corrupt.click('pick',0);corrupt.click('next');assert.ok(corrupt.root.innerHTML.includes('role="status"'));assert.equal(corrupt.values.get('smartprep-finals-v1'),'{broken');
 const blocked=harness(null,{blocked:true});assert.equal(blocked.warning.hidden,false);blocked.click('library');blocked.click('mock');blocked.click('submit');blocked.confirm();assert.ok(blocked.root.innerHTML.includes('Your results'));
});
test('actual app: backup import validates before replacement, cancellation preserves progress, reset is explicit',async()=>{
 const h=harness();h.click('library');h.click('mixed');const backup=h.state();h.click('exit');
 await h.importFile('{invalid');assert.ok(h.notice.textContent.includes('Import rejected'));assert.equal(h.state().active.id,backup.active.id);
 await h.importFile(backup);assert.ok(h.dialog.open);h.cancel();assert.equal(h.state().active.id,backup.active.id);
 const restored=structuredClone(backup);restored.active.label='Imported session';await h.importFile(restored);h.confirm();assert.equal(h.state().active.label,'Imported session');
 h.click('reset');h.cancel();assert.ok(h.state().active);h.click('reset');h.confirm();assert.equal(h.state().active,null);assert.deepEqual(h.state().history,[]);
});
test('actual app: flags persist globally, filter into a review session, and can be removed',()=>{
 const h=harness();h.click('library');h.click('chapter',7);h.click('chapter-practice',7);const id=h.state().active.items[0].id;h.click('flag');assert.deepEqual(h.state().flags,[id]);h.click('exit');h.click('flags');h.confirm();assert.deepEqual(h.state().active.items.map(i=>i.id),[id]);assert.ok(h.state().active.items[0].flag);h.click('flag');assert.deepEqual(h.state().flags,[]);
});

test('requested journey: fresh visit, Chapter 9, DMA topic, checked explanation, recommendation and corrected retry',()=>{
 const h=harness();h.click('library');h.click('chapter',9);assert.ok(h.root.innerHTML.includes('9:DMA'));h.click('topic','9:DMA');
 const s=h.state().active;assert.ok(s.items.every(i=>questions.some(q=>q.id===i.id&&q.chapter===9&&q.topic==='DMA')));assert.equal(s.items.length,6);
 const q=questions.find(q=>q.id===s.items[0].id);h.click('pick',q.answer===0?1:0);h.click('next');assert.ok(h.root.innerHTML.includes(q.explanation));h.click('submit');h.confirm();assert.ok(h.root.innerHTML.includes('You missed 6 of 6 DMA questions'));
 h.click('retry');const retry=h.state().active;const first=questions.find(q=>q.id===retry.items[0].id);h.click('pick',first.answer);h.click('next');assert.equal(h.state().latest[first.id].correct,true);assert.equal(h.state().first[first.id].correct,false);assert.equal(h.state().history.length,1);
});
test('requested journey: mock flag and skip survive reload; edits stay deferred until submission',()=>{
 const h=harness();h.click('library');h.click('mock');h.click('flag');h.click('skip');const saved=h.state();
 const resumed=harness(JSON.stringify(saved));assert.ok(resumed.root.innerHTML.includes('Resume session'));resumed.click('resume');assert.equal(resumed.state().active.index,1);assert.deepEqual(resumed.state().active.items,saved.active.items);
 resumed.click('next-flagged');assert.equal(resumed.state().active.index,0);const q=questions.find(q=>q.id===saved.active.items[0].id);resumed.click('pick',(q.answer+1)%q.choices.length);resumed.click('next');resumed.click('previous');resumed.click('pick',q.answer);assert.ok(!resumed.root.innerHTML.includes(q.explanation));resumed.click('submit');resumed.confirm();assert.equal(resumed.state().latest[q.id].correct,true);assert.ok(resumed.root.innerHTML.includes(q.explanation));
});
test('requested journey: existing midterm data is retained but absent from all finals starting paths',()=>{
 const archive=archiveQuestions[0],p=freshProgress(),bank=new Map([...questions,...archiveQuestions].map(q=>[q.id,q]));
 p.active=createSession([archive]);setDraft(p.active,archive.answer);confirmCurrent(p.active);finishSession(p,bank);p.active=createSession([archive,questions[0]],{size:2});const original=structuredClone(p.active);
 const h=harness(JSON.stringify({version:2,...p}));assert.ok(h.root.innerHTML.includes('Start studying'));assert.ok(!h.root.innerHTML.includes('Resume session'));assert.deepEqual(h.state().archivedSessions,[original]);assert.equal(h.state().history.length,1);
 h.click('library');assert.ok(!h.root.innerHTML.includes('midterm'));assert.ok(!h.root.innerHTML.includes('Review missed'));assert.equal((h.root.innerHTML.match(/data-action="chapter"/g)||[]).length,5);
 h.click('mixed');assert.ok(h.state().active.items.every(i=>questions.some(q=>q.id===i.id)));assert.deepEqual(h.state().archivedSessions,[original]);
 h.click('exit');h.click('chapter',1);assert.ok(!h.root.innerHTML.includes('CHAPTER 1</p>'));h.click('missed');assert.ok(h.notice.textContent.includes('No questions'));
});
