export function escape(text) {
  return String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
export function action(label, name, style = 'quiet', value = '') {
  return `<button type="button" class="button ${style}" data-action="${name}" data-value="${escape(value)}">${escape(label)}</button>`;
}
export function renderStart() {
  return `<section class="start"><div class="start-mark" aria-hidden="true"><i></i><i></i><i></i></div>
    <p class="course-code">CIS 4100</p><h1 tabindex="-1">Computer<br>organization.</h1>
    <p class="lede">Finals study bank · Chapters 7–11</p>${action('Start studying','library','primary')}
    <p class="start-note">One question at a time. Explanations when you need them.</p></section>`;
}
function chapterRows(chapters, questions) {
  return chapters.map(ch => `<li><button class="chapter" type="button" data-action="chapter" data-value="${ch.number}">
    <span class="chapter-number">${ch.number}</span><span><strong>${escape(ch.title)}</strong><small>${escape(ch.subtitle)} · ${questions.filter(q=>q.chapter===ch.number).length} questions</small></span><span aria-hidden="true">＋</span></button></li>`).join('');
}
export function renderLibrary(chapters, questions, progress, overlap) {
  const finals = chapters.filter(c=>c.number>=7), archive = chapters.filter(c=>c.number<7);
  const hasMissed = Object.values(progress.latest).some(r=>!r.correct);
  return `<section class="library"><p class="course-code">CIS 4100 · CHAPTERS 7–11</p><h1 tabindex="-1">What will you study?</h1>
    <p class="lede">Pick a chapter, or mix things up.</p><div class="library-actions">
    ${progress.active?action('Resume session','resume','primary'):action('Mixed practice','mixed','primary')}
    ${progress.active?action('Mixed practice','mixed','outline'):''}${action('Mock test','mock','outline')}${hasMissed?action('Review missed','missed','outline'):''}</div>
    <h2>Finals chapters</h2><ol class="chapters">${chapterRows(finals,questions)}</ol>
    <details class="more"><summary>More study options</summary><div class="options">
      <label>Chapter scope<select id="scope"><option value="finals">All finals chapters</option>${chapters.map(c=>`<option value="${c.number}">Chapter ${c.number} · ${escape(c.title)}</option>`).join('')}</select></label>
      <label>Topic<select id="topic"><option value="">All topics</option></select></label>
      <label>Practice length<select id="length"><option value="10">10 questions</option><option value="20">20 questions</option><option value="40">40 questions</option><option value="all">All in pool</option></select></label>
      <label>Mock length<select id="mock-length"><option value="20">20 questions</option><option value="40">40 questions</option><option value="all">All in pool</option></select></label>
      <label>Optional session timer<select id="minutes"><option value="0">No timer</option><option value="5">5 minutes</option><option value="15">15 minutes</option><option value="30">30 minutes</option><option value="60">60 minutes</option></select></label>
    </div><div class="library-actions">${action('Practice selection','filtered','primary')}${action('Mock selection','filtered-mock','outline')}${action('Cram selection','cram','outline')}${action('All in selection','full','outline')}${action('Review flags','flags','outline')}</div>
    <p class="muted">Cram starts with latest misses, then unseen questions, then previous correct answers. Quick buttons use the lengths and timer above; chapter buttons use practice length.</p>
    <details class="more"><summary>Six repeatable finals mocks</summary><p class="muted">20 questions each · ${overlap.unique} unique questions · ${overlap.reused} reused slots. Same questions and answer order each time.</p>
    <div class="library-actions">${Array.from({length:6},(_,i)=>action(`Mock ${i+1}`,'saved-mock','outline',i)).join('')}</div>
    <div class="table-scroll"><table><caption>Shared questions between mocks</caption><thead><tr><th scope="col">Mock</th>${overlap.matrix.map((_,i)=>`<th scope="col">${i+1}</th>`).join('')}</tr></thead><tbody>${overlap.matrix.map((row,i)=>`<tr><th scope="row">${i+1}</th>${row.map(n=>`<td>${n}</td>`).join('')}</tr>`).join('')}</tbody></table></div></details></details>
    <details class="more"><summary>Optional midterm archive · Chapters 1–6</summary><p class="muted">Separate from the finals quick actions. Original question IDs are preserved.</p><ol class="chapters">${chapterRows(archive,questions)}</ol></details>
    <details class="more"><summary>Progress, history & backups</summary>${renderHistory(progress,questions)}</details>
    <p class="footnote">Practice settings describe this app. Exam coverage, timing, and format are unspecified.</p></section>`;
}
function renderHistory(progress, questions) {
  const first = Object.values(progress.first), latest = Object.values(progress.latest);
  return `<p class="history-summary">${first.filter(r=>r.correct).length} / ${first.length} first attempts correct · ${progress.retries.correct} / ${progress.retries.total} retries correct · ${latest.filter(r=>!r.correct).length} latest misses</p>
    <p class="muted">Finalized skips and unanswered items count as not correct. A retry never changes a first attempt.</p>
    <ol class="history">${[...progress.history].reverse().map(s=>`<li><div><strong>${escape(s.label)}</strong><small>${new Date(s.finished).toLocaleString()} · ${escape(s.reason || 'submitted')}</small></div>${action('View results','history','outline',s.id)}</li>`).join('')||'<li>No completed sessions yet.</li>'}</ol>
    <div class="library-actions">${action('Export progress JSON','export','outline')}${action('Reset progress…','reset','outline')}</div>
    <label class="file-label">Import SmartPrep progress<input id="import-progress" type="file" accept=".json,application/json"></label>
    <details class="more"><summary>Import legacy Study Studio progress</summary><p class="muted">Archive content is already included. This separate import accepts completed Study Studio v1 history. Finish any active legacy session before exporting. Import replaces progress after confirmation.</p><label class="file-label">Legacy progress JSON<input id="import-legacy" type="file" accept=".json,application/json"></label></details>`;
}
export function renderQuiz(session, question) {
  const item = session.items[session.index], feedback = item.checked && !session.mock;
  const selected = session.draft ?? item.draft ?? item.pick, last = session.index === session.items.length-1;
  const choices = item.order.map((choice,position)=>{
    const correct = feedback && choice === question.answer, wrong = feedback && choice === item.pick && !correct;
    const badge = question.type==='true-false'?question.choices[choice][0]:'ABCD'[position];
    return `<li><button class="choice ${correct?'correct':''} ${wrong?'wrong':''}" type="button" data-action="pick" data-value="${choice}" aria-pressed="${selected===choice}" ${feedback?'disabled':''}>
      <span class="choice-key" aria-hidden="true">${badge}</span><span>${escape(question.choices[choice])}</span><strong class="answer-status">${correct?'Correct answer':wrong?'Your answer · Incorrect':''}</strong></button></li>`;
  }).join('');
  return `<section class="lesson"><div class="lesson-rail">${action('Save & exit','exit')}<progress value="${session.items.filter(i=>i.checked).length}" max="${session.items.length}" aria-label="Questions answered"></progress><span>${session.index+1} / ${session.items.length}</span></div>
    <div class="quiz-tools"><span class="course-code">${escape(session.label)} · Ch ${question.chapter}</span><span id="timer" role="timer" aria-label="Time remaining"></span><button class="button quiet" data-action="flag" aria-pressed="${item.flag}">${item.flag?'Flagged':'Flag question'}</button></div>
    <div class="lesson-body"><div class="lesson-prompt"><p class="topic-label">${escape(question.topic)} · ${question.type==='true-false'?'True / False':'Single answer'}</p><h1 tabindex="-1">${escape(question.prompt)}</h1><p class="shortcut-note">${session.mock?'Answers stay editable until submission.':'Choose an answer, then check.'}</p></div>
    <div class="lesson-work"><ul class="choices" aria-label="Answers">${choices}</ul>${feedback?`<div class="feedback" tabindex="-1" role="status"><strong>${item.pick===question.answer?'Correct':'Incorrect'}</strong><p>${escape(question.explanation)}</p><small>Chapter ${question.chapter} · ${escape(question.reference)}</small></div>`:''}</div></div>
    <div class="lesson-actions">${session.index>0?action('Back','previous'):''}${!feedback&&!item.checked?action('Skip','skip'):''}
      <button type="button" class="button primary" data-action="next" ${!feedback&&!session.mock&&selected===null?'disabled':''}>${feedback?(last?'Finish session':'Continue'):session.mock?(last?'Review & submit':'Save & next'):'Check answer'}</button></div>
    <details class="navigator"><summary>Question navigator</summary><p class="muted">${session.mock?'Answered means saved, without grading.':'Checked practice answers are fixed.'} Skipped questions stay available until you finish.</p><div class="question-grid">${session.items.map((i,n)=>{
      const state=i.checked?'Answered':i.skipped?'Skipped':i.draft!==null?'Selected':'Unanswered';
      return `<button class="nav-question ${n===session.index?'current':''}" type="button" data-action="goto" data-value="${n}" ${n===session.index?'aria-current="step"':''}>${n+1}<small>${state}${i.flag?' · Flagged':''}</small></button>`;
    }).join('')}</div>${action(session.mock?'Submit mock…':'Finish session…','submit','outline')}</details>
    <details class="keyboard-help"><summary>Keyboard shortcuts</summary><p>T/F or A–D and 1–4 select. Enter checks or continues when no control has focus. Tab and Enter operate controls. S skips, P goes back, R flags.</p></details></section>`;
}
export function renderResults(result, recommendation, label = 'Session complete') {
  const missed=result.entries.filter(e=>!e.correct);
  return `<section class="results"><p class="course-code">${escape(label)}</p><div class="results-top"><div><h1 tabindex="-1">Your results</h1><p class="score">${result.correct}<span> / ${result.total}</span></p><p class="lede">${result.correct} correct · ${result.total-result.correct-result.unanswered} incorrect · ${result.unanswered} unanswered</p><p class="muted">${result.skipped} skipped · ${result.unanswered-result.skipped} left unanswered</p></div>
    <div class="next-step">${recommendation?`<p class="course-code">NEXT TOPIC · CHAPTER ${recommendation.chapter}</p><h2>${escape(recommendation.topic)}</h2><p class="muted">${recommendation.fresh?'Try unseen questions on this topic.':'Revisit the missed questions on this topic.'}</p>${action('Practice this topic','follow-up','primary')}`:`<h2>All correct.</h2><p class="muted">Choose another chapter when you’re ready.</p>${action('Back to chapters','library','primary')}`}</div></div>
    <div class="library-actions">${missed.length?action('Retry missed','retry','outline'):''}${recommendation?action('Back to chapters','library'):''}</div>
    <details><summary>Review all ${result.total} answers</summary><ol class="answer-review">${result.entries.map(({question:q,pick,correct,status})=>`<li><p class="course-code">${q.id} · ${escape(q.topic)}</p><p><strong>${escape(q.prompt)}</strong></p><p>${correct?'Correct':pick===null?status==='skipped'?'Skipped':'Unanswered':`Incorrect · You chose ${escape(q.choices[pick])}`} · Correct answer: ${escape(q.choices[q.answer])}</p><p>${escape(q.explanation)}</p><small>Chapter ${q.chapter} · ${escape(q.reference)}</small></li>`).join('')}</ol></details></section>`;
}

