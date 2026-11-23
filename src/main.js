import { chapters as finalsChapters } from './data/chapters.js';
import { questions as finalsQuestions } from './data/questions.js';
import { archiveChapters, archiveQuestions } from './data/archive.js';
import { createSession, confirmCurrent, setDraft, navigate, score, recommend, recordItem, finishSession, savedMocks, mockOverlap, cramPool } from './logic/session.js';
import { loadProgress, saveProgress, freshProgress, validateProgress, importLegacy } from './logic/storage.js';
import { renderStart, renderLibrary, renderQuiz, renderResults } from './views/screens.js';
const chapters = [...finalsChapters,...archiveChapters], questions = [...finalsQuestions,...archiveQuestions];
const bank = new Map(questions.map(q=>[q.id,q])), mocks = savedMocks(finalsQuestions);
const root = document.querySelector('#main'), warning = document.querySelector('#storage-status');
const dialog = document.querySelector('#confirm-dialog'), notice = document.querySelector('#notice');
const loaded = loadProgress(bank);
let progress = loaded.progress, canSave = loaded.writable, screen = 'start', result, recommendation, resultLabel, pending, originFocus;
function save() { if (canSave) canSave = saveProgress(progress); warning.hidden = canSave; }
function say(message) { notice.textContent = message; notice.hidden = false; }
function ask(title, message, label, callback) {
  originFocus = document.activeElement;
  document.querySelector('#confirm-title').textContent = title;
  document.querySelector('#confirm-message').textContent = message;
  document.querySelector('#confirm-ok').textContent = label;
  pending = callback; dialog.showModal();
}
dialog.addEventListener('close',()=>{
  const callback = pending; pending = null;
  if (dialog.returnValue==='confirm') callback?.();
  else if (originFocus?.isConnected) originFocus.focus();
  dialog.returnValue='';
});
function render(focus='heading') {
  document.body.dataset.screen=screen;
  const session=progress.active;
  if(screen==='start') root.innerHTML=renderStart();
  if(screen==='library') { root.innerHTML=renderLibrary(chapters,questions,progress,mockOverlap(mocks)); updateTopics(); }
  if(screen==='quiz') root.innerHTML=renderQuiz(session,bank.get(session.items[session.index].id));
  if(screen==='results') root.innerHTML=renderResults(result,recommendation,resultLabel);
  if(focus==='feedback') root.querySelector('.feedback')?.focus({preventScroll:true});
  else if(focus==='none') {} else { window.scrollTo(0,0); root.querySelector('h1')?.focus({preventScroll:true}); }
  tick();
}
function show(target) { screen=target; notice.hidden=true; render(); }
function options(mock=false) {
  const length=root.querySelector(mock?'#mock-length':'#length')?.value;
  return {size:length==='all'?questions.length:Number(length || (mock?20:10)), minutes:Number(root.querySelector('#minutes')?.value || 0)};
}
function selectedPool() {
  const scope=root.querySelector('#scope')?.value || 'finals', topic=root.querySelector('#topic')?.value;
  return questions.filter(q=>(scope==='finals'?q.chapter>=7:q.chapter===Number(scope)) && (!topic || `${q.chapter}:${q.topic}`===topic));
}
function updateTopics() {
  const select=root.querySelector('#topic'); if(!select) return;
  const scope=root.querySelector('#scope').value;
  select.replaceChildren(new Option('All topics',''));
  const pool=questions.filter(q=>scope==='finals'?q.chapter>=7:q.chapter===Number(scope));
  for(const [value,q] of new Map(pool.map(q=>[`${q.chapter}:${q.topic}`,q]))) select.add(new Option(`Ch ${q.chapter} · ${q.topic}`,value));
}
function start(pool, settings={}) {
  const session=createSession(pool,settings);
  if(!session) { say('No questions match this selection yet. Choose a different topic or complete a session first.'); return; }
  for(const item of session.items)item.flag=progress.flags.includes(item.id);
  const begin=()=>{
    // Start the optional clock when the session actually opens, after replacement confirmation.
    const duration=session.deadline===null?null:session.deadline-session.started;
    session.started=Date.now();session.deadline=duration===null?null:session.started+duration;
    progress.active=session;save();show('quiz');
  };
  if(progress.active) ask('End this session and start another?','The current session will be saved in history. Remaining skips and unanswered questions count as not correct.','End & start',()=>{finishSession(progress,bank,'ended early');begin();});
  else begin();
}
function showResult(sc,label) {
  result=sc; resultLabel=label;
  recommendation=recommend(result.entries,questions,new Set(Object.keys(progress.first)));
  show('results');
}
function finish(reason='submitted') {
  const label=progress.active.label;
  const sc=finishSession(progress,bank,reason); save(); showResult(sc,reason==='timer expired'?`${label} · Timer expired`:label);
}
function submit() {
  const s=progress.active;
  if(s.mock) confirmCurrent(s);
  save(); const sc=score(s,bank);
  ask(s.mock?'Submit this mock?':'Finish this session?',`${sc.total-sc.unanswered} answered · ${sc.skipped} skipped · ${sc.unanswered-sc.skipped} left unanswered. Unanswered items count as not correct.`,s.mock?'Submit mock':'Finish session',()=>finish());
}
function pick(choice) {
  if(!setDraft(progress.active,choice)) return;
  for(const button of root.querySelectorAll('[data-action="pick"]')) button.setAttribute('aria-pressed',String(Number(button.dataset.value)===choice));
  root.querySelector('[data-action="next"]').disabled=false; updateCurrentStatus();save();
}
function updateCurrentStatus() {
  const s=progress.active,item=s.items[s.index];
  const status=root.querySelector(`[data-action="goto"][data-value="${s.index}"] small`);
  if(status)status.textContent=`${item.checked?'Answered':item.skipped?'Skipped':item.draft!==null?'Selected':'Unanswered'}${item.flag?' · Flagged':''}`;
}
function step(action) {
  const s=progress.active, item=s.items[s.index];
  if(action==='previous') { navigate(s,s.index-1);save();render();return; }
  if(action==='skip') {
    if(item.checked) return;
    item.skipped=true;item.draft=null;s.draft=null;
  } else if(!s.mock&&!item.checked) {
    if(confirmCurrent(s)) { recordItem(progress,s,item,bank);save();render('feedback'); }
    return;
  } else if(s.mock) confirmCurrent(s);
  if(s.index===s.items.length-1) {save();render('none');submit();return;}
  navigate(s,s.index+1);save();render();
}
function exportProgress() {
  const blob=new Blob([JSON.stringify({version:2,...progress},null,2)],{type:'application/json'}), url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download='smartprep-progress.json';a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);say('Progress exported. Keep the JSON file as your backup.');
}
async function importProgress(file,legacy) {
  if(!file) return;
  try {
    if(file.size>12000000) throw new Error('Backup exceeds 12 MB.');
    const raw=JSON.parse(await file.text()), candidate=legacy?importLegacy(raw,bank):validateProgress(raw,bank);
    ask('Replace current progress?',`${candidate.history.length} completed sessions${candidate.active?' and a resumable session':''} will be imported. Export current progress first if you want to keep it. Archive content is unchanged.`,'Replace progress',()=>{
      progress=candidate;canSave=true;save();show('library');say('Progress imported.');
    });
  } catch(error) {say(`Import rejected; current progress was kept. ${error.message}`);}
}
root.addEventListener('change',event=>{
  if(event.target.id==='scope') updateTopics();
  if(event.target.id==='import-progress'||event.target.id==='import-legacy') importProgress(event.target.files[0],event.target.id==='import-legacy');
});
root.addEventListener('click',event=>{
  const button=event.target.closest('button[data-action]');if(!button) return;
  const {action,value}=button.dataset, s=progress.active;
  switch(action) {
    case 'library':show('library');break;
    case 'exit':save();show('library');break;
    case 'resume':show('quiz');break;
    case 'chapter':start(questions.filter(q=>q.chapter===Number(value)),{...options(),label:`Chapter ${value} practice`});break;
    case 'mixed':start(finalsQuestions,{...options(),label:'Mixed practice'});break;
    case 'mock':start(finalsQuestions,{...options(true),label:'Mock test',mock:true});break;
    case 'filtered':case 'filtered-mock':start(selectedPool(),{...options(action==='filtered-mock'),label:action==='filtered'?'Topic practice':'Selected mock',mock:action==='filtered-mock'});break;
    case 'full':start(selectedPool(),{...options(),size:questions.length,label:'Full selection'});break;
    case 'cram':start(cramPool(selectedPool(),progress.latest),{...options(),label:'Cram practice',ordered:true});break;
    case 'saved-mock':start(mocks[Number(value)],{...options(true),size:20,label:`Saved mock ${Number(value)+1}`,mock:true,ordered:true,seed:`saved-mock-${value}-v2`});break;
    case 'missed':start(questions.filter(q=>progress.latest[q.id]&&!progress.latest[q.id].correct),{...options(),label:'Review latest missed'});break;
    case 'flags':start(selectedPool().filter(q=>progress.flags.includes(q.id)),{...options(),label:'Flagged questions'});break;
    case 'retry':start(result.entries.filter(e=>!e.correct).map(e=>e.question),{label:'Retry missed'});break;
    case 'follow-up':start(recommendation.pool,{label:`Ch ${recommendation.chapter} · ${recommendation.topic}`,size:5});break;
    case 'pick':pick(Number(value));break;
    case 'flag':{const item=s.items[s.index];item.flag=!item.flag;progress.flags=progress.flags.filter(id=>id!==item.id);if(item.flag)progress.flags.push(item.id);button.setAttribute('aria-pressed',String(item.flag));button.textContent=item.flag?'Flagged':'Flag question';updateCurrentStatus();save();break;}
    case 'goto':navigate(s,Number(value));save();render();root.querySelector('.navigator').open=true;break;
    case 'previous':case 'skip':case 'next':step(action);break;
    case 'submit':submit();break;
    case 'history':{const old=progress.history.find(s=>s.id===value);if(old) showResult(score(old,bank),old.label);break;}
    case 'export':exportProgress();break;
    case 'reset':ask('Reset all progress?','This removes saved sessions, attempts, and history from this browser. Export a backup first to keep them.','Reset progress',()=>{progress=freshProgress();canSave=true;save();show('library');say('Progress reset.');});break;
  }
});
document.addEventListener('keydown',event=>{
  if(screen!=='quiz'||dialog.open||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey||event.repeat||event.target.closest('input,select,textarea,[contenteditable]'))return;
  const s=progress.active,item=s.items[s.index],q=bank.get(item.id),key=event.key.toLowerCase();
  const keys=q.type==='true-false'?'tf':'abcd',position=/^[1-4]$/.test(key)?Number(key)-1:keys.indexOf(key);
  if(position>=0&&position<item.order.length){event.preventDefault();pick(item.order[position]);}
  else if(key==='enter'&&!event.target.closest('button,summary,a')) {event.preventDefault();step('next');}
  else if(key==='s'&&!item.checked){event.preventDefault();step('skip');}
  else if(key==='p'&&s.index>0){event.preventDefault();step('previous');}
  else if(key==='r'){event.preventDefault();root.querySelector('[data-action="flag"]').click();}
});
function tick() {
  const s=progress.active;if(!s?.deadline) return;
  const remaining=Math.max(0,Math.ceil((s.deadline-Date.now())/1000));
  const timer=root.querySelector('#timer');if(timer) timer.textContent=`${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,'0')} remaining`;
  if(remaining===0) {
    if(dialog.open){pending=null;dialog.close('expired');}
    finish('timer expired');
  }
}
setInterval(tick,1000);document.addEventListener('visibilitychange',tick);
warning.hidden=canSave;render();
