import { chapters as finalsChapters } from './data/chapters.js';
import { questions as finalsQuestions } from './data/questions.js';
import { archiveQuestions } from './data/archive.js';
import { createSession, confirmCurrent, setDraft, navigate, score, recommend, recordItem, finishSession, currentItem, similarQuestion, startFollowUp, endFollowUp } from './logic/session.js';
import { loadProgress, saveProgress, validateProgress, importLegacy, listBackups, adoptUnreadable, key } from './logic/storage.js';
import { renderStart, renderLibrary, renderSettings, renderQuiz, renderResults, renderShell, renderChapters, renderChapter, renderHistory, renderProgress, renderReview, setScorer } from './views/screens.js';
import { todayPlan, pickPlan, snapshot } from './logic/dashboard.js';
import { isFinals, isFinalsSession, parkArchiveSession, scopeProgress, resetFinalsProgress } from './logic/finals.js';
const chapters = finalsChapters, questions = finalsQuestions;
const bank = new Map([...questions,...archiveQuestions].map(q=>[q.id,q]));
const root = document.querySelector('#main'), banner = document.querySelector('#storage-status');
const dialog = document.querySelector('#confirm-dialog'), notice = document.querySelector('#notice');
const loaded = loadProgress(bank);
let progress = loaded.progress, screen = 'start', currentChapter = 7, result, recommendation, resultLabel, resultSession, pending, originFocus, lastQuestionKey = '';
// Storage state. canWrite=false means writing could destroy something we could not read (or storage is blocked).
let storageStatus = loaded.status, canWrite = loaded.writable, writeFailed = false, dirty = false, retryTimer = null;
const prefsKey = `${key}.prefs`;
let prefs = { length: 10, mockLength: 20, minutes: 0, keyHints: true, celebrate: true, vibrate: false };
let lastSavedAt = null, whyOpen = false, toastTimer = null, dragStart = null, suppressClick = false;
try { prefs = { ...prefs, ...JSON.parse(localStorage.getItem(prefsKey) || '{}') }; } catch {}
const parkedArchive = parkArchiveSession(progress, bank);
const answeredIds = () => new Set(Object.entries(progress.latest).filter(([,r]) => r.status === 'answered').map(([id]) => id));

function savedAgo() {
  if (!lastSavedAt) return 'nothing changed yet this visit';
  const s = Math.round((Date.now() - lastSavedAt) / 1000);
  return s < 45 ? 'just now' : s < 3600 ? `${Math.round(s / 60)} min ago` : new Date(lastSavedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}
function storageInfo() {
  const info = baseStorageInfo();
  if (info.tone === 'ok') return { ...info, title: 'Saving automatically', line: lastSavedAt ? `Last saved ${savedAgo()} · this browser` : 'Up to date · this browser' };
  return { ...info, title: storageStatus === 'blocked' || storageStatus === 'unreadable' ? 'Not saving · in memory only' : 'Save failed · retrying', line: 'Export to keep this visit’s progress' };
}
function baseStorageInfo() {
  const exportNote = 'Export saves a JSON backup you can import later.';
  if (storageStatus === 'blocked') return { tone: 'warn', summary: 'Not saving. This browser is blocking storage for this page, so progress from this visit is in memory only and will be lost when the page closes or reloads.', detail: exportNote, retry: true, banner: 'Progress is not being saved: this browser is blocking storage for this page. Export before you close or reload.' };
  if (storageStatus === 'unreadable') return { tone: 'warn', summary: 'Not saving. Your saved progress could not be read, so it has been left untouched. Progress from this visit is in memory only.', detail: `Start a new save keeps a copy of the unreadable data under Preserved copies. ${exportNote}`, adopt: true, banner: 'Your saved progress could not be read and has been left untouched. This visit is in memory only. Export to keep it.' };
  if (writeFailed) return { tone: 'warn', summary: 'Your latest progress could not be saved. Retrying automatically; until it works, recent answers are in memory only.', detail: exportNote, retry: true, banner: 'Your latest answer could not be saved. Retrying; until then it is in memory only. Export to keep it.' };
  const recovered = storageStatus === 'recovered' ? `Recovered your progress: ${loaded.dropped} damaged ${loaded.dropped === 1 ? 'record' : 'records'} could not be read. The original save is kept under Preserved copies. ` : '';
  return { tone: 'ok', summary: `${recovered}Saving automatically to this browser.`, detail: 'The offline file and the local server each keep their own save. Use Export and Import to move progress between them.' };
}
function renderBanner() {
  const info = storageInfo();
  banner.hidden = !info.banner;
  if (info.banner) banner.innerHTML = `<span>${info.banner}</span><span class="banner-actions"><button type="button" class="button text small" data-action="export">Export progress</button><button type="button" class="button text small" data-action="settings">Settings</button></span>`;
}
function save() {
  dirty = true;
  if (canWrite) {
    if (saveProgress(progress)) { dirty = false; lastSavedAt = Date.now(); if (writeFailed) { writeFailed = false; say('Saved. Your progress is back in this browser.'); } }
    else { writeFailed = true; clearTimeout(retryTimer); retryTimer = setTimeout(() => { if (writeFailed) save(); }, 4000); }
  }
  renderBanner();
}
// Toast: a short status message at the bottom of the screen, optionally with Undo. It hides itself after a few seconds.
function say(message, { undo = null, duration = 5000 } = {}) {
  notice.textContent = message; notice.hidden = false;
  if (undo && document.createElement && notice.append) {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'toast-undo'; button.textContent = 'Undo';
    button.addEventListener('click', () => { undo(); notice.hidden = true; }); notice.append(button);
  }
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { notice.hidden = true; }, duration);
}
// The feedback sheet's explanation opens and closes in place (no re-render, so nothing jumps).
function setWhy(open) {
  whyOpen = open;
  const sheet = root.querySelector('.sheet'); if (!sheet?.classList) return;
  sheet.classList.toggle('is-open', open);
  for (const b of root.querySelectorAll('[data-action="why"]')) b.setAttribute('aria-expanded', String(open));
  root.querySelector('.sheet-handle')?.setAttribute('aria-label', open ? 'Hide the explanation' : 'Show the explanation');
}
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
// Keep the marked answer (with its "why not" line) clear of the sticky feedback sheet and the sticky rail.
function reveal(element) {
  const sheet = root.querySelector('.sheet, .bar-bottom'); if (!element?.getBoundingClientRect || !sheet?.getBoundingClientRect) return;
  const box = element.getBoundingClientRect(), sheetTop = sheet.getBoundingClientRect().top, railBottom = root.querySelector('.lesson-rail')?.getBoundingClientRect().bottom || 0;
  if (box.bottom > sheetTop - 12) window.scrollBy?.(0, Math.min(box.bottom - sheetTop + 16, box.top - railBottom - 12));
}
// Theme: 'system' follows the device; 'light'/'dark' are stored per browser.
function applyTheme() { const html=document.documentElement; if(html?.dataset){ if(prefs.theme==='light'||prefs.theme==='dark') html.dataset.theme=prefs.theme; else delete html.dataset.theme; } }
function savePrefs() { try{localStorage.setItem(prefsKey,JSON.stringify(prefs));}catch{} }
const shellFor = { library:'today', chapters:'chapters', chapter:'chapters', progress:'progress', history:'progress', results:'progress', review:'review', settings:'settings' };
function render(focus='heading') {
  document.body.dataset.screen=screen;
  const scoped=scopeProgress(progress,bank), session=progress.active;
  const wrap=html=>renderShell(shellFor[screen],html,{reviewCount:questions.filter(q=>progress.latest[q.id]?.status==='answered'&&!progress.latest[q.id].correct).length,theme:prefs.theme||'system'});
  if(screen==='start') root.innerHTML=renderStart(scoped,chapters,questions,{theme:prefs.theme||'system'});
  if(screen==='library') root.innerHTML=wrap(renderLibrary(chapters,questions,scoped,{prefs}));
  if(screen==='chapters') root.innerHTML=wrap(renderChapters(chapters,questions,scoped));
  if(screen==='chapter') root.innerHTML=wrap(renderChapter(chapters.find(c=>c.number===currentChapter),questions,scoped));
  if(screen==='history') root.innerHTML=wrap(renderHistory(scoped));
  if(screen==='progress') root.innerHTML=wrap(renderProgress(chapters,questions,scoped,{prefs}));
  if(screen==='review') root.innerHTML=wrap(renderReview(questions,scoped));
  if(screen==='settings') root.innerHTML=wrap(renderSettings({progress:scoped,questions,storage:storageInfo(),prefs,backups:listBackups(),archived:(progress.archivedSessions||[]).length}));
  if(screen==='quiz') {
    const item=currentItem(session), q=bank.get(item.id), questionKey=`${session.id}:${session.index}:${session.followUp?.id||''}`;
    const similar=!session.mock&&!session.followUp&&item.checked&&item.pick!==q.answer?similarQuestion(q,questions,session,answeredIds()):null;
    const fresh=questionKey!==lastQuestionKey; if(fresh||!item.checked) whyOpen=false;
    root.innerHTML=renderQuiz(session,q,{bank,similar,fresh,whyOpen,prefs});lastQuestionKey=questionKey;
  }
  if(screen==='results') root.innerHTML=wrap(renderResults(result,recommendation,resultLabel,{progress:scoped,chapters,questions,session:resultSession}));
  if(focus==='feedback') { const f=root.querySelector('.feedback'); f?.focus({preventScroll:true}); reveal(root.querySelector('.choices .is-wrong')||root.querySelector('.choices .is-correct')); }
  else if(focus==='none') {}
  else if(/^[[#]/.test(focus)) { root.querySelector(focus)?.focus(); }
  else { window.scrollTo(0,0); root.querySelector('h1')?.focus({preventScroll:true}); }
  tick();
}
function show(target) { screen=target; notice.hidden=true; render(); }
function options(mock=false) {
  const length=root.querySelector(mock?'#mock-length':'#length')?.value ?? (mock?prefs.mockLength:prefs.length);
  return {size:length==='all'?questions.length:Number(length || (mock?20:10)), minutes:mock?Number(root.querySelector('#minutes')?.value ?? prefs.minutes ?? 0):0};
}
function start(pool, settings={}) {
  pool=pool.filter(isFinals);
  const session=createSession(pool,{seen:answeredIds(),...settings});
  if(!session) { say('No questions match this selection yet. Choose a different topic or complete a session first.'); return; }
  for(const item of session.items)item.flag=progress.flags.includes(item.id);
  const begin=()=>{
    // Start the optional clock when the session actually opens, after replacement confirmation.
    const duration=session.deadline===null?null:session.deadline-session.started;
    session.started=Date.now();session.deadline=duration===null?null:session.started+duration;
    session.items[0].shown=true;session.before=snapshot(chapters,questions,scopeProgress(progress,bank));progress.active=session;save();show('quiz');
  };
  if(progress.active) ask('End this session and start another?','The current session will be saved in history. Questions you did not answer stay unseen on your map; they are not counted as misses.','End & start',()=>{finishSession(progress,bank,'ended early');begin();});
  else begin();
}
function showResult(sc,label,session) {
  result=sc; resultLabel=label; resultSession=session;
  recommendation=recommend(result.entries,questions,answeredIds());
  show('results');
}
function finish(reason='submitted') {
  const label=progress.active.label;
  const sc=finishSession(progress,bank,reason); save(); showResult(sc,reason==='timer expired'?`${label} · Timer expired`:label,progress.history.at(-1));
}
function submit() {
  const s=progress.active;
  if(s.followUp) endFollowUp(s,bank);
  if(s.mock) confirmCurrent(s);
  save(); const sc=score(s,bank);
  ask(s.mock?'Submit this mock?':'End this session?',`${sc.total-sc.unanswered} answered, ${sc.unanswered} unanswered (${sc.skipped} skipped). Unanswered questions are not scored as correct, and they stay unseen on your map.`,s.mock?'Submit mock':'End session',()=>finish());
}
function pick(choice) {
  if(!setDraft(progress.active,choice)) return;
  for(const button of root.querySelectorAll('[data-action="pick"]')) button.setAttribute('aria-pressed',String(Number(button.dataset.value)===choice));
  const next=root.querySelector('[data-action="next"]'); if(next) next.disabled=false;
  updateCurrentStatus();save();
}
// Optional haptic tick after checking (browsers without the Vibration API, such as iOS Safari, ignore it).
function buzz(item) { if(prefs.vibrate) try{ navigator.vibrate?.(item.pick===bank.get(item.id).answer?15:[25,60,25]); }catch{} }
function updateCurrentStatus() {
  const s=progress.active,item=s.items[s.index];
  const status=root.querySelector(`[data-action="goto"][data-value="${s.index}"] small`);
  if(status)status.textContent=`${item.checked?'Saved':item.skipped?'Skipped':item.draft!==null?'Selected':'Unanswered'}${item.flag?' · Flagged':''}`;
}
function step(action) {
  const s=progress.active;
  if(s.followUp) {
    const f=s.followUp;
    if(action!=='next') return;
    if(!f.checked) { if(confirmCurrent(s)) { recordItem(progress,s,f,bank);buzz(f);save();render('feedback'); } return; }
    endFollowUp(s,bank);save();render();say(`Back to question ${s.index+1} of ${s.items.length}.`);return;
  }
  const item=s.items[s.index];
  if(action==='previous') { navigate(s,s.index-1);save();render();return; }
  if(action==='skip') {
    if(item.checked) return;
    item.skipped=true;item.draft=null;s.draft=null;
  } else if(!s.mock&&!item.checked) {
    if(confirmCurrent(s)) { recordItem(progress,s,item,bank);buzz(item);save();render('feedback'); }
    return;
  } else if(s.mock) confirmCurrent(s);
  if(s.index===s.items.length-1) {save();render('none');submit();return;}
  navigate(s,s.index+1);save();render();
}
function download(text, name) {
  const blob=new Blob([text],{type:'application/json'}), url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=name;a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function exportProgress() { download(JSON.stringify({version:3,...progress},null,2),'finals-progress.json'); say('Progress exported. Keep the JSON file as your backup.'); }
// Explicit replacement (import, reset, new save) never destroys an unreadable save: it is copied aside first.
function makeWritable() {
  if (canWrite) return true;
  if (storageStatus === 'unreadable') { const copy = adoptUnreadable(); if (!copy) return false; }
  else if (storageStatus === 'blocked') return false;
  canWrite = true; storageStatus = 'ok'; return true;
}
async function importProgress(file,legacy) {
  if(!file) return;
  try {
    if(file.size>12000000) throw new Error('Backup exceeds 12 MB.');
    const raw=JSON.parse(await file.text()), candidate=legacy?importLegacy(raw,bank):validateProgress(raw,bank);
    ask('Replace current progress?',`${candidate.history.length} completed sessions${candidate.active?' and a resumable session':''} will be imported. Export current progress first if you want to keep it.`,'Replace progress',()=>{
      progress=candidate;parkArchiveSession(progress,bank);
      if(!makeWritable()) say('Imported for this visit only: storage is not available, so the import is in memory.');
      save();show('library');if(canWrite)say('Progress imported.');
    });
  } catch(error) {say(`Import rejected; current progress was kept. ${error.message}`,{duration:10000});}
}
root.addEventListener('change',event=>{
  const target=event.target;
  if(target.id==='import-progress'||target.id==='import-legacy') importProgress(target.files[0],target.id==='import-legacy');
  if(target.dataset&&'pref' in target.dataset) {
    if(target.id==='exam-date'){prefs.examDate=/^\d{4}-\d{2}-\d{2}$/.test(target.value)?target.value:'';savePrefs();render('#exam-date');say(prefs.examDate?'Exam date saved.':'Exam date cleared.');return;}
    const name={length:'length','mock-length':'mockLength',minutes:'minutes'}[target.id];
    if(name){prefs[name]=target.value==='all'?'all':Number(target.value);savePrefs();say('Default saved.');}
  }
});
function onAction(action, value, button) {
  const s=progress.active;
  switch(action) {
    case 'library':show('library');break;
    case 'settings':show('settings');break;
    case 'exit':save();show('library');break;
    case 'resume':if(isFinalsSession(progress.active,bank)){lastQuestionKey='';show('quiz');}else show('library');break;
    case 'chapter':if(chapters.some(c=>c.number===Number(value))){currentChapter=Number(value);show('chapter');}break;
    case 'chapters':show('chapters');break;
    case 'history-list':show('history');break;
    case 'progress':show('progress');break;
    case 'review-list':show('review');break;
    case 'theme':{const before=prefs.theme||'system',next=['light','dark'].includes(value)?value:'system';if(before===next)break;
      const applyChoice=v=>{prefs.theme=v;savePrefs();applyTheme();render(`[data-action="theme"][data-value="${v}"]`);};
      applyChoice(next);say(`Appearance: ${{system:'Auto',light:'Light',dark:'Dark'}[next]} · saved`,{undo:()=>applyChoice(before)});break;}
    case 'toggle-pref':{if(!['keyHints','celebrate','vibrate'].includes(value))break;const was=value==='vibrate'?prefs.vibrate===true:prefs[value]!==false;
      const set=v=>{prefs[value]=v;savePrefs();render(`[data-action="toggle-pref"][data-value="${value}"]`);};
      set(!was);say(`${button?.querySelector?.('.set-text span')?.textContent||'Setting'} ${!was?'on':'off'} · saved`,{undo:()=>set(was)});break;}
    case 'why':if(suppressClick){suppressClick=false;break;}setWhy(!whyOpen);break;
    case 'exam':show('settings');root.querySelector('#exam-date')?.focus();break;
    case 'today':{const plan=todayPlan(chapters,questions,scopeProgress(progress,bank));const pool=pickPlan(plan);if(pool.length)start(pool,{label:'Today’s session',size:pool.length,ordered:true});else start(finalsQuestions,{...options(),label:'Mixed practice'});break;}
    case 'retry-one':{const q=bank.get(value);if(q&&isFinals(q))start([q],{label:`Retry · ${q.topic}`});break;}
    case 'chapter-practice':start(questions.filter(q=>q.chapter===Number(value)),{...options(),label:`Chapter ${value} practice`});break;
    case 'chapter-missed':start(questions.filter(q=>q.chapter===Number(value)&&progress.latest[q.id]?.status==='answered'&&!progress.latest[q.id].correct),{...options(),label:`Chapter ${value} · to review`});break;
    case 'topic':{const colon=value.indexOf(':'),chapter=Number(value.slice(0,colon)),topic=value.slice(colon+1);start(questions.filter(q=>q.chapter===chapter&&q.topic===topic),{...options(),label:`Ch ${chapter} · ${topic}`});break;}
    case 'mixed':start(finalsQuestions,{...options(),label:'Mixed practice'});break;
    case 'mock':start(finalsQuestions,{...options(true),label:'Mock test',mock:true});break;
    case 'missed':start(questions.filter(q=>progress.latest[q.id]?.status==='answered'&&!progress.latest[q.id].correct),{...options(),label:'To review'});break;
    case 'flags':start(questions.filter(q=>progress.flags.includes(q.id)),{...options(),label:'Flagged questions'});break;
    case 'retry':start(result.entries.filter(e=>e.status==='answered'&&!e.correct).map(e=>e.question),{label:'Retry missed'});break;
    case 'follow-up':start(recommendation.pool,{label:`Ch ${recommendation.chapter} · ${recommendation.topic}`,size:5});break;
    case 'concept':start(recommendation.conceptPool,{label:`Ch ${recommendation.chapter} · fresh on the idea you missed`,size:3});break;
    case 'similar':{const item=s.items[s.index],match=similarQuestion(bank.get(item.id),questions,s,answeredIds());if(match&&startFollowUp(s,match.question)){save();render();}break;}
    case 'leave-follow':endFollowUp(s,bank);save();render();break;
    case 'pick':pick(Number(value));break;
    case 'flag':{const item=s.items[s.index];item.flag=!item.flag;progress.flags=progress.flags.filter(id=>id!==item.id);if(item.flag)progress.flags.push(item.id);save();render('[data-action="flag"]');break;}
    case 'next-unanswered':case 'next-flagged':{
      if(s.mock)confirmCurrent(s);
      const candidates=Array.from({length:s.items.length},(_,n)=>(s.index+n+1)%s.items.length);
      const index=candidates.find(n=>action==='next-flagged'?s.items[n].flag:!s.items[n].checked);
      if(index===undefined){save();say(action==='next-flagged'?'No flagged questions.':'All questions have saved answers.');break;}
      navigate(s,index);save();render();root.querySelector('.navigator').open=true;break;
    }
    case 'goto':navigate(s,Number(value));save();render();root.querySelector('.navigator').open=true;break;
    case 'previous':case 'skip':case 'next':step(action);break;
    case 'submit':submit();break;
    case 'history':{const old=scopeProgress(progress,bank).history.find(s=>s.id===value);if(old) showResult(score(old,bank),old.label,old);break;}
    case 'export':exportProgress();break;
    case 'export-backup':{try{const text=localStorage.getItem(value);if(text){download(text,`${value.replace(/[^\w.-]/g,'_')}.json`);say('Copy exported.');}}catch{say('That copy could not be read.');}break;}
    case 'retry-storage':
      if(storageStatus==='blocked'){try{localStorage.getItem(key);say('Storage is available again. Export this visit first if you need it, then reload to load your saved progress.');}catch{say('Storage is still blocked for this page.');}}
      else{save();if(!writeFailed)say('Saved.');}
      if(screen==='settings')render('none');break;
    case 'adopt':ask('Start a new save?','The unreadable data is copied to Preserved copies first. Then progress from this visit becomes your saved progress.','Start new save',()=>{if(makeWritable()){save();say('New save started. The unreadable data is kept as a copy.');}else say('A copy of the unreadable data could not be made, so nothing was changed.');render('none');});break;
    case 'reset':ask('Reset finals progress?','This clears finals answers, sessions, and flags. Archived midterm data is kept. Export a backup first to keep your finals progress.','Reset finals',()=>{progress=resetFinalsProgress(progress,bank);makeWritable();save();show('library');say('Finals progress reset.');});break;
  }
}
root.addEventListener('click',event=>{
  const button=event.target.closest('button[data-action]');if(!button) return;
  onAction(button.dataset.action,button.dataset.value,button);
});
// Drag the feedback sheet's handle: up opens the explanation, down closes it. A plain tap toggles (via the click handler).
root.addEventListener('pointerdown',event=>{ if(event.target.closest?.('.sheet-handle')) dragStart=event.clientY; });
root.addEventListener('pointerup',event=>{
  if(dragStart===null) return; const dy=event.clientY-dragStart; dragStart=null;
  if(Math.abs(dy)>12){ suppressClick=true; setWhy(dy<0); setTimeout(()=>{suppressClick=false;},400); }
});
banner.addEventListener('click',event=>{
  const button=event.target.closest?.('button[data-action]');if(button) onAction(button.dataset.action,button.dataset.value,button);
});
document.addEventListener('keydown',event=>{
  if(dialog.open||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey||event.repeat||event.target.closest('input,select,textarea,[contenteditable]'))return;
  // Study map: arrow keys move between chapter rows, chapter actions and topic buttons.
  if(screen==='chapter'&&(event.key==='ArrowDown'||event.key==='ArrowUp')&&event.target.closest('[data-nav]')) {
    const items=[...root.querySelectorAll('[data-nav]')],index=items.indexOf(event.target.closest('[data-nav]'));
    const next=items[index+(event.key==='ArrowDown'?1:-1)];if(next){event.preventDefault();next.focus();}return;
  }
  if(screen!=='quiz')return;
  const s=progress.active,item=currentItem(s),q=bank.get(item.id),key=event.key.toLowerCase(),follow=!!s.followUp;
  const keys=q.type==='true-false'?'tf':'abcd',position=/^[1-4]$/.test(key)?Number(key)-1:keys.indexOf(key);
  if(position>=0&&position<item.order.length){event.preventDefault();pick(item.order[position]);}
  else if(key==='enter'&&!event.target.closest('button,summary,a')) {event.preventDefault();step('next');}
  else if(key==='s'&&!item.checked&&!follow){event.preventDefault();step('skip');}
  else if(key==='p'&&s.index>0&&!follow){event.preventDefault();step('previous');}
  else if(key==='r'&&!follow){event.preventDefault();root.querySelector('[data-action="flag"]')?.click();}
  else if(key==='w'&&root.querySelector('.sheet')){event.preventDefault();setWhy(!whyOpen);}
});
function tick() {
  const s=progress.active;if(!s?.deadline||!isFinalsSession(s,bank)) return;
  const remaining=Math.max(0,Math.ceil((s.deadline-Date.now())/1000));
  const timer=root.querySelector('#timer');if(timer) timer.textContent=`${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,'0')} remaining`;
  if(remaining===0) {
    if(dialog.open){pending=null;dialog.close('expired');}
    finish('timer expired');
  }
}
setInterval(tick,1000);document.addEventListener('visibilitychange',()=>{tick();if(writeFailed)save();});
window.addEventListener?.('beforeunload',event=>{if(dirty&&(!canWrite||writeFailed)){event.preventDefault();event.returnValue='';}});
// Persist migrations and recoveries right away (the original payload was copied aside by loadProgress when needed).
if(parkedArchive||loaded.migrated||storageStatus==='recovered')save();
setScorer(s=>score(s,bank).correct);applyTheme();
// First visit opens on the welcome screen; anyone with finals progress lands on Today.
{const scoped=scopeProgress(progress,bank);if(scoped.active||Object.keys(scoped.latest).length)screen='library';}
renderBanner();render();
if(loaded.migrated&&loaded.status==='ok')say('Your saved progress was updated: unanswered and skipped questions no longer count as misses. Session history is unchanged.');
if(storageStatus==='recovered')say(storageInfo().summary);
