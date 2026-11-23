import { studyStatus, cellState } from '../logic/finals.js';
export function escape(text) {
  return String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
export function action(label, name, style = 'quiet', value = '', extra = '') {
  return `<button type="button" class="button ${style}" data-action="${name}" data-value="${escape(value)}"${extra ? ` ${extra}` : ''}>${escape(label)}</button>`;
}
export const address = n => `0x${n.toString(16).toUpperCase().padStart(2, '0')}`;
const stateLabel = { correct: 'Correct', review: 'To review', unseen: 'Unseen' };
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
// Question cells, grouped by topic. Decorative for assistive tech: every row and topic carries a text summary.
function cells(pool, progress, { changed = new Set(), group = true } = {}) {
  const one = q => {
    const state = cellState(q, progress), flagged = progress.flags.includes(q.id);
    return `<i class="cell c-${state}${flagged ? ' flagged' : ''}${changed.has(q.id) ? ' changed' : ''}" title="${q.id} · ${stateLabel[state]}${flagged ? ' · Flagged' : ''}"></i>`;
  };
  if (!group) return `<span class="cells" aria-hidden="true">${pool.map(one).join('')}</span>`;
  return `<span class="cells" aria-hidden="true">${[...Map.groupBy(pool, q => q.topic).values()].map(g => `<span class="cell-group">${g.map(one).join('')}</span>`).join('')}</span>`;
}
const legend = () => `<p class="legend"><span><i class="cell c-correct"></i>Correct</span><span><i class="cell c-review"></i>To review</span><span><i class="cell c-unseen"></i>Unseen</span><span><i class="cell c-unseen flagged"></i>Flagged</span></p>`;
function overall(questions, progress) {
  const s = studyStatus(questions, progress);
  return s.unseen === s.total ? `${s.total} questions across five chapters. Nothing answered yet.` : s.text;
}

export function renderStart(progress = {}, chapters = [], questions = []) {
  const resume = progress.active;
  const rows = chapters.map((ch, i) => {
    const pool = questions.filter(q => q.chapter === ch.number), status = studyStatus(pool, progress);
    return `<li class="map-row" style="--row:${i}"><span class="addr">${address(ch.number)}</span><span class="row-main"><strong>${escape(ch.title)}</strong><small>${escape(status.text)}</small></span>${cells(pool, progress)}</li>`;
  }).join('');
  return `<section class="welcome"><div class="invite"><p class="eyebrow">CIS 4100 · Final review · Chapters 7–11</p><h1 tabindex="-1">Load what you know.</h1>
    <p class="lede">${escape(questions.length ? overall(questions, progress) : 'Chapters 7–11')}</p>
    <div class="actions">${action(resume ? 'Resume session' : 'Start studying', resume ? 'resume' : 'library', 'primary')}</div>
    ${resume ? `<p class="resume-note">${escape(resume.label)} · question ${resume.index + 1} of ${resume.items.length} · ${action('Open study map', 'library', 'link')}</p>` : ''}</div>
    ${rows ? `<figure class="map welcome-map"><ol aria-label="Chapter map">${rows}</ol><figcaption>${legend()}</figcaption></figure>` : ''}</section>`;
}

export function renderLibrary(chapters, questions, progress, open = null) {
  const misses = questions.filter(q => cellState(q, progress) === 'review').length, flagged = questions.filter(q => progress.flags.includes(q.id)).length;
  const primary = progress.active ? 'resume' : misses ? 'missed' : 'mixed';
  const primaryLabel = { resume: 'Resume session', missed: `Review ${plural(misses, 'missed question')}`, mixed: 'Mixed practice · 10' }[primary];
  const hint = progress.active ? `${progress.active.label} · question ${progress.active.index + 1} of ${progress.active.items.length}` : overall(questions, progress);
  const secondary = [primary !== 'mixed' && action('Mixed practice', 'mixed', 'text'), action('Mock test', 'mock', 'text'),
    primary === 'resume' && misses && action(`Review ${plural(misses, 'missed question')}`, 'missed', 'text'), flagged && action(`Flagged · ${flagged}`, 'flags', 'text')].filter(Boolean).join('');
  const rows = chapters.map(ch => {
    const pool = questions.filter(q => q.chapter === ch.number), status = studyStatus(pool, progress), isOpen = open === ch.number;
    const topics = [...Map.groupBy(pool, q => q.topic)].map(([topic, items]) => `<li class="topic"><span class="topic-main"><strong>${escape(topic)}</strong><small>${escape(studyStatus(items, progress).text)}</small></span>${cells(items, progress, { group: false })}
      ${action('Practice', 'topic', 'outline small', `${ch.number}:${topic}`, `data-nav aria-label="Practice ${escape(topic)}, ${plural(items.length, 'question')}"`)}</li>`).join('');
    const panel = isOpen ? `<div class="chapter-panel" id="chapter-${ch.number}"><p class="panel-actions">${action(`Practice all ${pool.length}`, 'chapter-practice', 'outline small', ch.number, 'data-nav')}${status.missed ? action(`Review ${plural(status.missed, 'missed question')}`, 'chapter-missed', 'text small', ch.number, 'data-nav') : ''}</p><ul class="topics" aria-label="Chapter ${ch.number} topics">${topics}</ul></div>` : '';
    return `<li class="chapter-row${isOpen ? ' open' : ''}"><button class="row-button" type="button" data-action="chapter" data-value="${ch.number}" data-nav aria-expanded="${isOpen}" aria-controls="chapter-${ch.number}">
      <span class="addr">${address(ch.number)}</span><span class="row-main"><strong>${escape(ch.title)}</strong><small>${escape(status.text)}</small></span>${cells(pool, progress)}<span class="chev" aria-hidden="true"></span></button>${panel}</li>`;
  }).join('');
  return `<section class="hub"><div class="hub-top"><p class="eyebrow">Study map · Chapters 7–11</p>${action('Settings', 'settings', 'text small')}</div>
    <h1 tabindex="-1">What will you load next?</h1><p class="lede">${escape(hint)}</p>
    <div class="actions">${action(primaryLabel, primary, 'primary')}<span class="text-actions">${secondary}</span></div>
    <ol class="map hub-map" aria-label="Chapters. Open a chapter to see its topics.">${rows}</ol>${legend()}</section>`;
}

export function renderSettings({ progress, questions, storage, prefs, backups = [], archived = 0 }) {
  const select = (id, label, value, options) => `<label>${label}<select id="${id}" data-pref>${options.map(([v, t]) => `<option value="${v}"${String(v) === String(value) ? ' selected' : ''}>${t}</option>`).join('')}</select></label>`;
  const history = [...progress.history].reverse().slice(0, 30);
  return `<section class="settings">${action('← Study map', 'library', 'text small')}<p class="eyebrow">Settings</p><h1 tabindex="-1">Progress, backups, and defaults</h1>
    <section class="panel" aria-labelledby="save-title"><h2 id="save-title">Saving</h2><p class="save-state save-${storage.tone}">${escape(storage.summary)}</p>${storage.detail ? `<p class="muted">${escape(storage.detail)}</p>` : ''}
      <div class="actions">${action('Export progress', 'export', 'outline')}${storage.retry ? action('Try saving again', 'retry-storage', 'outline') : ''}${storage.adopt ? action('Start a new save…', 'adopt', 'outline') : ''}</div>
      <label class="file-label">Import a progress backup<input id="import-progress" type="file" accept=".json,application/json"></label>
      ${backups.length ? `<h3>Preserved copies of earlier saves</h3><ul class="plain-list">${backups.map(b => `<li><span>${new Date(b.at).toLocaleString()} · ${Math.max(1, Math.round(b.size / 1024))} KB</span>${action('Export copy', 'export-backup', 'text small', b.name)}</li>`).join('')}</ul>` : ''}</section>
    <section class="panel" aria-labelledby="sessions-title"><h2 id="sessions-title">Sessions</h2>
      ${progress.active ? `<p>${escape(progress.active.label)} · question ${progress.active.index + 1} of ${progress.active.items.length}</p><div class="actions">${action('Resume session', 'resume', 'outline')}</div>` : '<p class="muted">No session in progress.</p>'}
      ${archived ? `<p class="muted">${plural(archived, 'earlier session')} from the midterm archive ${archived === 1 ? 'is' : 'are'} kept in your backup but not shown here.</p>` : ''}
      <h3>History</h3><ol class="plain-list">${history.map(s => `<li><span><strong>${escape(s.label)}</strong><small>${new Date(s.finished).toLocaleString()}</small></span>${action('View results', 'history', 'text small', s.id)}</li>`).join('') || '<li class="muted">No finished sessions yet.</li>'}</ol>
      ${progress.flags.length ? `<div class="actions">${action(`Practice ${plural(progress.flags.length, 'flagged question')}`, 'flags', 'outline')}</div>` : ''}</section>
    <section class="panel" aria-labelledby="defaults-title"><h2 id="defaults-title">Session defaults</h2><div class="options">
      ${select('length', 'Practice length', prefs.length, [[10, '10 questions'], [20, '20 questions'], [40, '40 questions'], ['all', 'All available']])}
      ${select('mock-length', 'Mock length', prefs.mockLength, [[20, '20 questions'], [40, '40 questions'], ['all', 'All available']])}
      ${select('minutes', 'Mock timer', prefs.minutes, [[0, 'No timer'], [15, '15 minutes'], [30, '30 minutes'], [60, '60 minutes']])}</div>
      <p class="muted">Sessions use at most the available questions. Mocks hold feedback until you submit.</p></section>
    <section class="panel" aria-labelledby="keys-title"><h2 id="keys-title">Keyboard</h2><p class="muted">A–D, T/F or 1–4 select an answer. Enter checks or continues. S skips, P goes back, R flags, W opens Why?. In the study map, arrow keys move between chapters and topics.</p></section>
    <section class="panel" aria-labelledby="reset-title"><h2 id="reset-title">Reset</h2><p class="muted">Clears finals answers, sessions, and flags in this browser. Export first to keep them. Exam coverage, timing, and format are unspecified.</p><div class="actions">${action('Reset finals progress…', 'reset', 'text')}</div></section></section>`;
}

function stripCell(item, bank, { mock, current }) {
  const q = bank.get(item.id), state = mock ? item.checked || item.draft !== null ? 'saved' : item.skipped ? 'skip' : '' :
    item.checked ? item.pick === q.answer ? 'ok' : 'bad' : item.skipped ? 'skip' : '';
  return `<li class="${state}${current ? ' current' : ''}${item.flag ? ' flagged' : ''}"></li>`;
}
export function renderQuiz(session, question, { bank = null, similar = null, fresh = false } = {}) {
  const follow = session.followUp, item = follow || session.items[session.index], feedback = item.checked && (!session.mock || follow);
  const selected = follow ? item.draft ?? item.pick : session.draft ?? item.draft ?? item.pick, last = session.index === session.items.length - 1;
  const wrong = feedback && item.pick !== question.answer;
  const choices = item.order.map((choice, position) => {
    const correct = feedback && choice === question.answer, mine = feedback && choice === item.pick, bad = mine && !correct;
    const badge = question.type === 'true-false' ? question.choices[choice][0] : 'ABCD'[position];
    const why = bad && question.whyNot?.[choice];
    return `<li class="${correct ? 'is-correct' : ''}${bad ? ' is-wrong' : ''}"><button class="choice" type="button" data-action="pick" data-value="${choice}" aria-pressed="${selected === choice}" ${feedback ? 'disabled' : ''}${why ? ` aria-describedby="why-not"` : ''}>
      <span class="choice-key" aria-hidden="true">${badge}</span><span class="choice-text">${escape(question.choices[choice])}</span><span class="answer-status">${correct ? (mine ? 'Your answer · Correct' : 'Correct answer') : bad ? 'Your answer · Incorrect' : ''}</span></button>${why ? `<p class="why-not" id="why-not">${escape(why)}</p>` : ''}</li>`;
  }).join('');
  const strip = bank ? `<ol class="strip" aria-hidden="true">${session.items.map((i, n) => stripCell(i, bank, { mock: session.mock, current: n === session.index })).join('')}</ol>` : '<span></span>';
  const back = follow ? `Back to question ${session.index + 1}` : 'Continue';
  let actions;
  if (feedback) actions = `${wrong && similar && !follow ? action('Try a similar one', 'similar', 'outline') : ''}<button type="button" class="button primary" data-action="next">${back}</button>`;
  else if (follow) actions = `${action(`Back to question ${session.index + 1}`, 'leave-follow', 'text')}<button type="button" class="button primary" data-action="next" ${selected === null ? 'disabled' : ''}>Check answer</button>`;
  else if (session.mock) actions = `${session.index > 0 ? action('Back', 'previous', 'text') : ''}${item.checked ? '' : action('Skip', 'skip', 'text')}${action('Submit mock', 'submit', 'outline')}<button type="button" class="button primary" data-action="next">${last ? 'Save' : 'Save & next'}</button>`;
  else actions = `${session.index > 0 ? action('Back', 'previous', 'text') : ''}${action('Skip', 'skip', 'text')}<button type="button" class="button primary" data-action="next" ${selected === null ? 'disabled' : ''}>Check answer</button>`;
  const verdict = !feedback ? '' : `<div class="feedback" tabindex="-1" role="status"><p class="verdict"><strong>${wrong ? 'Not quite.' : 'Correct.'}</strong> ${wrong ? 'Your choice and the correct answer are marked above.' : follow ? 'That idea is landing.' : 'Locked in on your map.'}</p>
    <details class="why"${follow || !wrong ? '' : ''}><summary>Why?</summary><p>${escape(question.explanation)}</p><small>Source · Chapter ${question.chapter} · ${escape(question.reference)}</small></details>
    ${wrong && !follow && !similar ? '<p class="muted no-similar">No similar question in the bank yet. This one stays on your review list.</p>' : ''}</div>`;
  const nav = session.mock && !follow ? `<details class="navigator"><summary>All questions</summary><p class="muted">Answers stay editable until you submit.</p>
      <div class="actions">${action('Next unanswered', 'next-unanswered', 'outline small')}${action('Next flagged', 'next-flagged', 'outline small')}</div><div class="question-grid">${session.items.map((i, n) => {
        const state = i.checked ? 'Saved' : i.draft !== null ? 'Selected' : i.skipped ? 'Skipped' : 'Unanswered';
        return `<button class="nav-question ${n === session.index ? 'current' : ''}" type="button" data-action="goto" data-value="${n}" ${n === session.index ? 'aria-current="step"' : ''}>${n + 1}<small>${state}${i.flag ? ' · Flagged' : ''}</small></button>`;
      }).join('')}</div></details>` : '';
  return `<section class="lesson${fresh ? ' enter' : ''}${session.mock ? ' is-mock' : ''}"><div class="lesson-rail">${action('← Save & exit', 'exit', 'text small')}${strip}<span class="count">${session.index + 1} / ${session.items.length}</span>
    ${follow ? '<span></span>' : `<button type="button" class="button text small flag-button" data-action="flag" aria-pressed="${item.flag}">${item.flag ? 'Flagged' : 'Flag'}</button>`}</div>
    ${follow ? `<p class="follow-note">Similar question · not part of this session’s score. Your place is saved at question ${session.index + 1}.</p>` : ''}
    <div class="lesson-body"><p class="address"><span>${address(question.chapter)} · ${escape(question.topic)} · ${question.type === 'true-false' ? 'True / False' : 'Single answer'}${session.mock && !follow ? ' · Mock' : ''}</span><span id="timer" role="timer" aria-label="Time remaining"></span></p>
    <h1 tabindex="-1">${escape(question.prompt)}</h1><ul class="choices" aria-label="Answers">${choices}</ul>${verdict}</div>
    <div class="lesson-actions">${actions}</div>${nav}
    ${!session.mock && !follow ? `<p class="lesson-foot">${action('End session…', 'submit', 'text small')}</p>` : ''}</section>`;
}

export function renderResults(result, recommendation, label = 'Session complete', { progress = null, chapters = [], questions = [], session = null } = {}) {
  const missed = result.entries.filter(e => e.status === 'answered' && !e.correct), answered = result.entries.filter(e => e.status === 'answered');
  const notReached = result.entries.filter(e => e.pick === null && !e.shown).length;
  const strip = `<ol class="strip big" aria-hidden="true">${result.entries.map(e => `<li class="${e.status === 'answered' ? e.correct ? 'ok' : 'bad' : e.status === 'skipped' ? 'skip' : ''}"></li>`).join('')}</ol>`;
  const follows = session?.followUps?.length ? `<p class="muted">You also tried ${plural(session.followUps.length, 'similar question')} (${session.followUps.filter(f => f.correct).length} correct). ${session.followUps.length === 1 ? 'It is' : 'They are'} not part of this score.</p>` : '';
  let next;
  if (recommendation?.single) next = `<p class="eyebrow">Next step · ${escape(recommendation.topic)}</p><h2>Retry the ${plural(missed.length, 'question')} you missed</h2><p>You missed ${recommendation.missed} of ${recommendation.total} ${escape(recommendation.topic)} questions.</p>
      <div class="actions">${action(`Retry ${missed.length} missed`, 'retry', 'primary')}${recommendation.conceptPool.length ? action('Try a fresh question on this idea', 'concept', 'outline') : ''}</div>`;
  else if (recommendation) next = `<p class="eyebrow">Next topic · Chapter ${recommendation.chapter}</p><h2>${escape(recommendation.topic)}</h2><p>You missed ${recommendation.missed} of ${recommendation.total} ${escape(recommendation.topic)} questions.</p>
      <p class="muted">${recommendation.fresh ? `${plural(recommendation.pool.length, 'unseen question')} available.` : 'No unseen questions left on this topic, so you will revisit your misses.'}</p><div class="actions">${action(`Practice ${recommendation.topic}`, 'follow-up', 'primary')}${action(`Retry ${missed.length} missed`, 'retry', 'outline')}</div>`;
  else if (answered.length) next = `<h2>Everything you answered is correct</h2><p class="muted">Keep going with a fresh mix across Chapters 7–11.</p><div class="actions">${action('Practice another 10', 'mixed', 'primary')}</div>`;
  else next = `<h2>Nothing was answered</h2><p class="muted">Unanswered questions stay unseen on your map. They do not count as misses.</p><div class="actions">${action('Start mixed practice', 'mixed', 'primary')}</div>`;
  const changed = new Set(answered.map(e => e.question.id));
  const touched = progress ? chapters.filter(ch => result.entries.some(e => e.question.chapter === ch.number)) : [];
  const map = touched.length ? `<section class="results-map" aria-labelledby="map-title"><h2 id="map-title">On your map</h2><ol class="map">${touched.map(ch => {
    const pool = questions.filter(q => q.chapter === ch.number);
    return `<li class="map-row"><span class="addr">${address(ch.number)}</span><span class="row-main"><strong>${escape(ch.title)}</strong><small>${escape(studyStatus(pool, progress).text)}</small></span>${cells(pool, progress, { changed })}</li>`;
  }).join('')}</ol><p class="muted">Outlined cells changed in this session.</p></section>` : '';
  return `<section class="results"><p class="eyebrow">${escape(label)}</p><h1 tabindex="-1">Session results</h1><div class="score-line"><p class="score">${result.correct}<span> / ${result.total}</span></p>${strip}</div>
    <p class="lede">${missed.length} incorrect · ${result.unanswered} unanswered (${result.skipped} skipped${notReached ? `, ${notReached} not reached` : ''})</p>${follows}
    <div class="next-step">${next}</div>${map}
    <div class="actions">${action('Back to study map', 'library', 'text')}</div>
    <details><summary>Review all ${result.total} answers</summary><ol class="answer-review">${result.entries.map(({ question: q, pick, correct, status }) => `<li><p class="eyebrow">${q.id} · ${escape(q.topic)}</p><p><strong>${escape(q.prompt)}</strong></p><p>${correct ? 'Correct' : pick === null ? status === 'skipped' ? 'Skipped' : 'Unanswered' : `Incorrect · You chose ${escape(q.choices[pick])}`} · Correct answer: ${escape(q.choices[q.answer])}</p>${!correct && pick !== null && q.whyNot?.[pick] ? `<p class="why-not">${escape(q.whyNot[pick])}</p>` : ''}<p>${escape(q.explanation)}</p><small>Chapter ${q.chapter} · ${escape(q.reference)}</small></li>`).join('')}</ol></details></section>`;
}
