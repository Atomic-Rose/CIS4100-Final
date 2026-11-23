import { studyStatus } from '../logic/finals.js';
export function escape(text) {
  return String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
export function action(label, name, style = 'quiet', value = '') {
  return `<button type="button" class="button ${style}" data-action="${name}" data-value="${escape(value)}">${escape(label)}</button>`;
}
export function renderStart(progress = {}) {
  return `<section class="start"><p class="course-code">COMPUTER ORGANIZATION</p><h1 tabindex="-1">CIS 4100 Finals</h1>
    <p class="lede">Chapters 7–11</p><div class="library-actions">${action(progress.active?'Resume session':'Start studying',progress.active?'resume':'library','primary')}
    ${progress.active?action('Choose a chapter','library'):''}</div></section>`;
}
function settings() {
  return `<details class="session-settings"><summary>Session options</summary><div class="options">
    <label>Practice length<select id="length"><option value="10">10 questions</option><option value="20">20 questions</option><option value="40">40 questions</option><option value="all">All available</option></select></label>
    <label>Mock length<select id="mock-length"><option value="20">20 questions</option><option value="40">40 questions</option><option value="all">All available</option></select></label>
    <label>Timer<select id="minutes"><option value="0">No timer</option><option value="5">5 minutes</option><option value="15">15 minutes</option><option value="30">30 minutes</option><option value="60">60 minutes</option></select></label>
    </div><p class="muted">Sessions use at most the available questions. A mock is a practice format; feedback appears after submission.</p></details>`;
}
function chapterRows(chapters, questions, progress) {
  return chapters.map(ch => {
    const status=studyStatus(questions.filter(q=>q.chapter===ch.number),progress);
    return `<li><button class="chapter" type="button" data-action="chapter" data-value="${ch.number}"><span class="chapter-number">${ch.number}</span>
      <span><strong>${escape(ch.title)}</strong><small>${escape(status.text)}</small></span><span class="row-hint" aria-hidden="true">View</span></button></li>`;
  }).join('');
}
export function renderLibrary(chapters, questions, progress) {
  const misses=questions.filter(q=>progress.latest[q.id]&&!progress.latest[q.id].correct).length;
  const primary=progress.active?'resume':misses?'missed':'mixed';
  const primaryLabel=primary==='resume'?'Resume session':primary==='missed'?'Review missed':'Mixed practice';
  const hint=progress.active?`${progress.active.label} · Question ${progress.active.index+1} of ${progress.active.items.length}`:misses?`${misses} questions to revisit. A correct retry clears a miss.`:'10 questions, balanced across your finals chapters.';
  return `<section class="library"><p class="course-code">CIS 4100 FINALS · CHAPTERS 7–11</p><h1 tabindex="-1">Your next study session</h1>
    <p class="lede">${escape(hint)}</p><div class="library-actions">${action(primaryLabel,primary,'primary')}${action('Mock test','mock','outline')}
      ${primary!=='mixed'?action('Mixed practice','mixed'):''}${primary==='resume'&&misses?action('Review missed','missed'):''}</div>
    <h2>Study a chapter</h2><ol class="chapters">${chapterRows(chapters,questions,progress)}</ol>${settings()}
    <details class="more"><summary>Progress & backups</summary>${renderHistory(progress,questions)}</details>
    <p class="footnote">Exam coverage, timing, and format are unspecified.</p></section>`;
}
export function renderChapter(chapter, questions, progress) {
  const pool=questions.filter(q=>q.chapter===chapter.number), status=studyStatus(pool,progress);
  const topics=[...Map.groupBy(pool,q=>q.topic)].map(([topic,items])=>`<li><button class="topic-row" type="button" data-action="topic" data-value="${escape(`${chapter.number}:${topic}`)}"><span><strong>${escape(topic)}</strong><small>${escape(studyStatus(items,progress).text)} · ${items.length} questions</small></span><span class="row-hint">Practice</span></button></li>`).join('');
  return `<section class="chapter-view">${action('All chapters','library')}<p class="course-code">CHAPTER ${chapter.number}</p><h1 tabindex="-1">${escape(chapter.title)}</h1>
    <p class="lede">${escape(status.text)} · ${pool.length} questions</p><div class="library-actions">${action('Start practice','chapter-practice','primary',chapter.number)}${status.missed?action('Review chapter misses','chapter-missed','quiet',chapter.number):''}</div>
    <h2>Focus on a topic</h2><ol class="chapters topics">${topics}</ol>${settings()}</section>`;
}
function renderHistory(progress, questions) {
  const status=studyStatus(questions,progress);
  return `<p class="history-summary">${status.practiced} of ${questions.length} practiced · ${status.missed} to review</p>
    <p class="muted">Practiced means a unique question with a scored answer. Drafts, skipped items, and unfinished mock answers do not count.</p>
    <ol class="history">${[...progress.history].reverse().map(s=>`<li><div><strong>${escape(s.label)}</strong><small>${new Date(s.finished).toLocaleString()}</small></div>${action('View results','history','outline',s.id)}</li>`).join('')||'<li>No completed finals sessions yet.</li>'}</ol>
    <div class="library-actions">${progress.flags.length?action('Review flagged','flags','outline'):''}${action('Export progress JSON','export','outline')}${action('Reset progress…','reset')}</div>
    <label class="file-label">Import SmartPrep progress<input id="import-progress" type="file" accept=".json,application/json"></label>
    <p class="muted">Backups retain archival data. Only finals questions appear in this app.</p>`;
}
export function renderQuiz(session, question) {
  const item=session.items[session.index], feedback=item.checked&&!session.mock;
  const selected=session.draft??item.draft??item.pick, last=session.index===session.items.length-1;
  const choices=item.order.map((choice,position)=>{
    const correct=feedback&&choice===question.answer, wrong=feedback&&choice===item.pick&&!correct;
    const badge=question.type==='true-false'?question.choices[choice][0]:'ABCD'[position];
    return `<li><button class="choice ${correct?'correct':''} ${wrong?'wrong':''}" type="button" data-action="pick" data-value="${choice}" aria-pressed="${selected===choice}" ${feedback?'disabled':''}>
      <span class="choice-key" aria-hidden="true">${badge}</span><span>${escape(question.choices[choice])}</span><strong class="answer-status">${correct?(choice===item.pick?'Your answer · Correct':'Correct answer'):wrong?'Your answer · Incorrect':''}</strong></button></li>`;
  }).join('');
  return `<section class="lesson"><div class="lesson-rail">${action('Save & exit','exit')}<progress value="${session.items.filter(i=>i.checked).length}" max="${session.items.length}" aria-label="Questions answered"></progress><span>${session.index+1} / ${session.items.length}</span>
    <button class="button quiet flag-button" data-action="flag" aria-pressed="${item.flag}">${item.flag?'Flagged':'Flag'}</button></div>
    <div class="quiz-tools"><span class="course-code">${escape(session.label)}</span><span id="timer" role="timer" aria-label="Time remaining"></span></div>
    <div class="lesson-body"><div class="lesson-prompt"><p class="topic-label">Chapter ${question.chapter} · ${escape(question.topic)} · ${question.type==='true-false'?'True / False':'Single answer'}</p><h1 tabindex="-1">${escape(question.prompt)}</h1></div>
    <div class="lesson-work"><ul class="choices" aria-label="Answers">${choices}</ul>${feedback?`<div class="feedback" tabindex="-1" role="status"><strong>${item.pick===question.answer?'Correct':'Incorrect'}</strong><p>${escape(question.explanation)}</p><small>Chapter ${question.chapter} · ${escape(question.reference)}</small></div>`:''}</div></div>
    <div class="lesson-actions">${!feedback&&session.index>0?action('Back','previous'):''}${!feedback&&!item.checked?action('Skip','skip'):''}
      <button type="button" class="button primary" data-action="next" ${!feedback&&!session.mock&&selected===null?'disabled':''}>${feedback?'Continue':session.mock?(last?'Review & submit':'Save & next'):'Check answer'}</button></div>
    <details class="navigator"><summary>Question navigator</summary><p class="muted">${session.mock?'Answers stay editable. Explanations appear after submission.':'Checked answers are fixed; skipped questions can be revisited.'}</p>
      <div class="library-actions">${action('Next unanswered','next-unanswered','outline')}${action('Next flagged','next-flagged','outline')}</div><div class="question-grid">${session.items.map((i,n)=>{
        const state=i.checked?'Answered':i.draft!==null?'Selected':i.skipped?'Skipped':'Unanswered';
        return `<button class="nav-question ${n===session.index?'current':''}" type="button" data-action="goto" data-value="${n}" ${n===session.index?'aria-current="step"':''}>${n+1}<small>${state}${i.flag?' · Flagged':''}</small></button>`;
      }).join('')}</div>${action(session.mock?'Submit mock…':'Finish session…','submit','outline')}</details>
    <details class="keyboard-help"><summary>Keyboard shortcuts</summary><p>T/F or A–D and 1–4 select. Enter checks or continues while the prompt or feedback has focus. Tab and Enter operate controls. S skips, P goes back, R flags.</p></details></section>`;
}
export function renderResults(result, recommendation, label='Session complete') {
  const missed=result.entries.filter(e=>!e.correct);
  return `<section class="results"><p class="course-code">${escape(label)}</p><h1 tabindex="-1">Your results</h1><p class="score">${result.correct}<span> / ${result.total}</span></p>
    <p class="lede">${result.total-result.correct-result.unanswered} incorrect · ${result.unanswered} unanswered (${result.skipped} skipped)</p>
    <div class="next-step">${recommendation?`<p class="course-code">NEXT TOPIC · CHAPTER ${recommendation.chapter}</p><h2>${escape(recommendation.topic)}</h2><p>You missed ${recommendation.missed} of ${recommendation.total} ${escape(recommendation.topic)} questions.</p>
      <p class="muted">${recommendation.fresh?`${recommendation.pool.length} unseen questions available.`:'Revisit your misses on this topic.'}</p>${action('Practice this topic','follow-up','primary')}`:`<h2>All correct</h2><p class="muted">Keep going with a fresh mix across Chapters 7–11.</p>${action('Practice another 10','mixed','primary')}`}</div>
    <div class="library-actions">${missed.length?action('Retry missed','retry','outline'):''}${action('Back to chapters','library')}</div>
    <details><summary>Review all ${result.total} answers</summary><ol class="answer-review">${result.entries.map(({question:q,pick,correct,status})=>`<li><p class="course-code">${q.id} · ${escape(q.topic)}</p><p><strong>${escape(q.prompt)}</strong></p><p>${correct?'Correct':pick===null?status==='skipped'?'Skipped':'Unanswered':`Incorrect · You chose ${escape(q.choices[pick])}`} · Correct answer: ${escape(q.choices[q.answer])}</p><p>${escape(q.explanation)}</p><small>Chapter ${q.chapter} · ${escape(q.reference)}</small></li>`).join('')}</ol></details></section>`;
}
