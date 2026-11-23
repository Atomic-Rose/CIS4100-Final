import { cellState } from '../logic/finals.js';
import { counts, chapterCards, todayPlan, firstTry, streak, examCountdown, reviewList, ago } from '../logic/dashboard.js';
export function escape(text) {
  return String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
export function action(label, name, style = 'quiet', value = '', extra = '') {
  return `<button type="button" class="button ${style}" data-action="${name}" data-value="${escape(value)}"${extra ? ` ${extra}` : ''}>${escape(label)}</button>`;
}
export const address = n => `0x${n.toString(16).toUpperCase().padStart(2, '0')}`;
const plural = (n, word, many = `${word}s`) => `${n} ${n === 1 ? word : many}`;
const paths = {
  today: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/>',
  chapters: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  review: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>',
  mock: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5"/><path d="M9 2h6"/>',
  history: '<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>', check: '<path d="M20 6 9 17l-5-5"/>', flag: '<path d="M5 21V4h11l-1.5 4L16 12H5"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>', spark: '<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>',
};
export const icon = (name, size = 20, extra = '') => `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra ? ` ${extra}` : ''}>${paths[name]}</svg>`;
export const mark = (size = 28) => `<svg width="${size}" height="${size}" viewBox="0 0 28 28" aria-hidden="true" class="mark"><rect x="2" y="2" width="11" height="11" rx="3" class="m1"/><rect x="15" y="2" width="11" height="11" rx="3" class="m2"/><rect x="2" y="15" width="11" height="11" rx="3" class="m3"/><rect x="15" y="15" width="11" height="11" rx="3" class="m4"/></svg>`;
const bar = (c, cls = '') => `<span class="bar ${cls}" aria-hidden="true"><span class="bar-correct" style="width:${(c.correct / c.total * 100).toFixed(1)}%"></span><span class="bar-review" style="width:${(c.review / c.total * 100).toFixed(1)}%"></span></span>`;
const summary = c => c.correct + c.review === 0 ? `Not started · ${plural(c.total, 'question')}` : [c.correct && `${c.correct} correct`, c.review && `${c.review} to review`, c.unseen && `${c.unseen} unseen`].filter(Boolean).join(' · ');
function ring(c, size = 132) {
  const r = size * .394, circ = 2 * Math.PI * r, mid = size / 2, a = c.correct / c.total * circ, b = c.review / c.total * circ;
  return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="Readiness ${c.readiness} percent: ${c.correct} correct, ${c.review} to review, ${c.unseen} unseen of ${c.total} questions">
    <circle cx="${mid}" cy="${mid}" r="${r.toFixed(1)}" class="ring-track"/>${c.correct ? `<circle cx="${mid}" cy="${mid}" r="${r.toFixed(1)}" class="ring-correct" stroke-dasharray="${a.toFixed(1)} ${circ.toFixed(1)}" transform="rotate(-90 ${mid} ${mid})"/>` : ''}
    ${c.review ? `<circle cx="${mid}" cy="${mid}" r="${r.toFixed(1)}" class="ring-review" stroke-dasharray="${b.toFixed(1)} ${circ.toFixed(1)}" stroke-dashoffset="${(-a).toFixed(1)}" transform="rotate(-90 ${mid} ${mid})"/>` : ''}
    <text x="${mid}" y="${mid + 2}" text-anchor="middle" class="ring-value">${c.readiness}%</text><text x="${mid}" y="${mid + 22}" text-anchor="middle" class="ring-label">ready</text></svg>`;
}
const legend = c => `<ul class="legend-list"><li><span class="swatch s-correct" aria-hidden="true"></span><span><strong>${c.correct}</strong> correct</span></li><li><span class="swatch s-review" aria-hidden="true"></span><span><strong>${c.review}</strong> to review</span></li><li><span class="swatch s-unseen" aria-hidden="true"></span><span><strong>${c.unseen}</strong> unseen</span></li></ul>`;
export const themeSwitch = theme => `<div class="theme-switch" role="group" aria-label="Appearance">${[['system', 'Auto'], ['light', 'Light'], ['dark', 'Dark']].map(([v, l]) => `<button type="button" data-action="theme" data-value="${v}" aria-pressed="${theme === v}">${l}</button>`).join('')}</div>`;
let scoreOf = () => 0;
// main.js registers the scorer so views can show a session's score without holding the question bank.
export function setScorer(fn) { scoreOf = fn; }

// App shell: a sidebar on desktop, a tab bar on phones. Session screens (welcome, quiz) render without it.
export function renderShell(active, content, { reviewCount = 0, theme = 'system' } = {}) {
  const item = (key, label, act, extra = '') => `<li><button type="button" class="nav-item${active === key ? ' is-active' : ''}" data-action="${act}"${active === key ? ' aria-current="page"' : ''}>${icon(key, 22)}<span class="nav-label">${label}</span>${extra}</button></li>`;
  return `<div class="shell"><nav class="sidebar" aria-label="Main">
    <div class="brand">${mark()}<span class="brand-text"><strong>Final review</strong><small class="mono">CIS 4100 · Ch 7–11</small></span></div>
    <ul class="nav-list">${item('today', 'Today', 'library')}${item('chapters', 'Chapters', 'chapters')}${item('review', 'Review', 'missed', reviewCount ? `<span class="badge mono"><span class="visually-hidden">, </span>${reviewCount}<span class="visually-hidden"> to review</span></span>` : '')}${item('mock', 'Mock test', 'mock')}${item('history', 'History', 'history-list')}${item('settings', 'Settings', 'settings')}</ul>
    <div class="sidebar-foot"><span class="foot-label">Appearance</span>${themeSwitch(theme)}</div></nav>
    <div class="content">${content}</div></div>`;
}

export function renderStart(progress = {}, chapters = [], questions = [], { theme = 'system' } = {}) {
  const resume = progress.active, cards = questions.length ? chapterCards(chapters, questions, progress) : [], total = questions.length ? counts(questions, progress) : null;
  const lede = !total ? 'Chapters 7–11' : total.correct + total.review === 0 ? `${total.total} questions built from your slides and assignments. Practice a chapter, learn from every miss, and see exactly how ready you are.` : `${total.correct} correct · ${total.review} to review · ${total.unseen} unseen. Pick up where you left off.`;
  return `<section class="welcome"><header class="welcome-top"><span class="brand">${mark()}<strong>Final review</strong></span>${themeSwitch(theme)}</header>
    <div class="welcome-body"><div class="invite"><p class="eyebrow">CIS 4100 · Computer organization · Chapters 7–11</p><h1 tabindex="-1">Load what you know.</h1><p class="lede">${escape(lede)}</p>
      <div class="actions">${action(resume ? 'Resume session' : 'Start studying', resume ? 'resume' : 'library', 'primary large')}${resume ? action('Open dashboard', 'library', 'ghost large') : action('Add exam date', 'exam', 'ghost large')}</div>
      ${resume ? `<p class="muted">${escape(resume.label)} · question ${resume.index + 1} of ${resume.items.length}</p>` : `<ul class="ticks"><li>${icon('check', 18)}Feedback on the exact option you chose</li><li>${icon('check', 18)}A review list that only holds real misses</li><li>${icon('check', 18)}Works offline and saves in this browser</li></ul>`}</div>
      ${cards.length ? `<div class="preview" aria-hidden="true"><div class="card preview-card"><div class="preview-head"><strong>Your chapters</strong><span class="mono muted small">${total.correct + total.review} of ${total.total} answered</span></div>
        ${cards.map((c, i) => `<div class="preview-row" style="--i:${i}"><div class="preview-line"><span><span class="mono muted">${String(c.number).padStart(2, '0')}</span> <strong>${escape(c.title)}</strong></span><span class="muted small">${c.total} questions</span></div>${bar(c, 'grow')}</div>`).join('')}</div>
        <div class="card preview-note"><span class="mono muted small">Ch 9 · DMA</span><div class="note-wrong">${icon('close', 18)}<span><strong>Increasing the block length until transfers overlap</strong><span>Longer blocks make overlap more likely; overlap is the conflict, not a way to coordinate access.</span></span></div></div></div>` : ''}</div></section>`;
}

function chapterCard(c) {
  return `<li><button type="button" class="card chapter-card" data-action="chapter" data-value="${c.number}"><span class="card-top"><span class="mono eyebrow">Chapter ${c.number}</span><span class="pct">${c.readiness}%</span></span>
    <strong class="card-title">${escape(c.title)}</strong>${bar(c)}<span class="muted small">${summary(c)}</span><span class="small card-note">${escape(c.note)}</span></button></li>`;
}
function recentList(progress, now) {
  const recent = [...progress.history].reverse().slice(0, 3);
  if (!recent.length) return '<p class="muted empty">Finished sessions show up here with their scores.</p>';
  return `<ul class="plain">${recent.map(s => `<li class="recent-item"><span class="recent-text"><strong>${escape(s.label)}</strong><span class="muted small">${ago(s.finished, now)} · ${plural(s.items.length, 'question')}</span></span><button type="button" class="score-link mono" data-action="history" data-value="${escape(s.id)}" aria-label="View results for ${escape(s.label)}, ${scoreOf(s)} of ${s.items.length}">${scoreOf(s)}/${s.items.length}</button></li>`).join('')}</ul>`;
}

export function renderLibrary(chapters, questions, progress, { prefs = {}, now = Date.now() } = {}) {
  const total = counts(questions, progress), cards = chapterCards(chapters, questions, progress), plan = todayPlan(chapters, questions, progress);
  const ft = firstTry(questions, progress), st = streak(questions, progress, now), exam = examCountdown(prefs.examDate, now), list = reviewList(questions, progress);
  const flagged = questions.filter(q => progress.flags.includes(q.id)).length, active = progress.active, answered = total.correct + total.review;
  const date = new Date(now).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
  const sessionCard = active ? `<section class="card hero-card" aria-labelledby="today-title"><span class="pill pill-accent">${icon('spark', 14)}In progress</span>
      <h2 id="today-title">${escape(active.label)}</h2><p class="lede">Question ${active.index + 1} of ${active.items.length}. Your answers so far are saved.</p>
      <div class="actions">${action('Resume session', 'resume', 'primary large')}${action('Choose something else', 'chapters', 'ghost large')}</div></section>`
    : `<section class="card hero-card" aria-labelledby="today-title"><span class="pill pill-accent">${icon('spark', 14)}Today’s session</span>
      <h2 id="today-title">${escape(plan.title)}</h2><p class="lede">${plan.review.length || plan.focus ? 'Built from your review list and the started chapter with the most unseen questions.' : 'A balanced first look across the whole final.'} ${plural(plan.total || 10, 'question')}, feedback after each one.</p>
      <ul class="plain plan-list">${plan.review.length ? `<li><span class="count-chip chip-review mono">${plan.review.length}</span><span><strong>To review</strong><span class="muted"> · ${escape(plan.reviewTopics.slice(0, 3).join(', '))}</span></span></li>` : ''}${plan.fresh ? `<li><span class="count-chip chip-accent mono">${plan.fresh}</span><span><strong>Unseen</strong><span class="muted"> · ${plan.focus ? `Chapter ${plan.focus.number} · ${escape(plan.focus.title)}` : 'All five chapters'}</span></span></li>` : ''}</ul>
      <div class="actions">${plan.total ? action('Start session', 'today', 'primary large') : action('Mixed practice', 'mixed', 'primary large')}${action('Choose something else', 'chapters', 'ghost large')}</div></section>`;
  const more = [action('Mixed practice · 10', 'mixed', 'link'), action('Mock test · 20', 'mock', 'link'), total.review && action(`Review all ${total.review}`, 'missed', 'link'), flagged && action(`Flagged · ${flagged}`, 'flags', 'link')].filter(Boolean).join('<span class="sep" aria-hidden="true">·</span>');
  return `<div class="page today"><header class="page-head"><div><p class="eyebrow">${escape(date)}</p><h1 tabindex="-1">Today</h1></div><p class="muted head-summary">${answered ? `${total.correct} correct · ${total.review} to review · ${total.unseen} unseen` : `${total.total} questions across five chapters. Nothing answered yet.`}</p></header>
    <div class="row">${sessionCard}<section class="card ready-card" aria-labelledby="ready-title"><h2 id="ready-title">Readiness</h2><div class="ready-body">${ring(total)}${legend(total)}</div><p class="muted small">Readiness is the share of all ${total.total} questions whose latest answer is correct.</p></section></div>
    <p class="more-actions"><span class="muted">Or start:</span> ${more}</p>
    <div class="stats">
      <section class="card stat" aria-label="Answered"><span class="muted">Answered</span><strong class="stat-value">${answered} <small>of ${total.total}</small></strong><span class="muted small">${Math.round(answered / total.total * 100)}% of the bank</span></section>
      <section class="card stat" aria-label="First-try accuracy"><span class="muted">First-try accuracy</span><strong class="stat-value">${ft.answered ? `${ft.rate}%` : '–'}</strong><span class="muted small">${ft.answered ? `${ft.correct} of ${ft.answered} right the first time` : 'Answer a question to start'}</span></section>
      <section class="card stat" aria-label="Study streak"><span class="muted">Study streak</span><strong class="stat-value">${st.days} <small>${st.days === 1 ? 'day' : 'days'}</small></strong><span class="muted small">${st.today ? 'You studied today' : st.days ? `Practice today to make it ${st.days + 1}` : 'Answer a question today to start one'}</span></section>
      <section class="card stat exam${exam ? '' : ' is-empty'}" aria-labelledby="exam-title"><h2 id="exam-title" class="stat-title muted">Final exam</h2>${exam ? `<strong class="stat-value">${exam.days > 1 ? `${exam.days} <small>days</small>` : exam.days === 1 ? 'Tomorrow' : exam.days === 0 ? 'Today' : 'Passed'}</strong><span class="muted small">${escape(exam.label)}</span>` : '<strong class="stat-empty">No date yet</strong>'}
        <label class="date-field"><span class="${exam ? 'visually-hidden' : 'small muted'}">${exam ? 'Change exam date' : 'Add your exam date'}</span><input id="exam-date" type="date" value="${escape(prefs.examDate || '')}" data-pref></label></section></div>
    <section aria-labelledby="chapters-title" class="block"><div class="block-head"><h2 id="chapters-title">Chapters</h2><span class="muted small">${total.total} questions · ${chapters.length} chapters</span></div>
      <ul class="plain chapter-grid">${cards.map(chapterCard).join('')}</ul></section>
    <div class="row">
      <section class="card list-card" aria-labelledby="queue-title"><div class="block-head"><h2 id="queue-title">Review list</h2>${total.review ? action(`Review all ${total.review}`, 'missed', 'link') : ''}</div>
        ${list.length ? `<ul class="plain">${list.map(({ question: q, at }) => `<li class="queue-item"><span class="queue-text"><span class="mono muted small">Ch ${q.chapter} · ${escape(q.topic)} · missed ${ago(at, now)}</span><span class="clamp">${escape(q.prompt)}</span></span>${action('Retry', 'retry-one', 'outline', q.id, `aria-label="Retry ${escape(q.topic)} question ${q.id}"`)}</li>`).join('')}</ul>` : '<p class="muted empty">No misses waiting. Wrong answers land here until you get them right.</p>'}</section>
      <section class="card list-card" aria-labelledby="recent-title"><div class="block-head"><h2 id="recent-title">Recent sessions</h2>${progress.history.length ? action('All history', 'history-list', 'link') : ''}</div>${recentList(progress, now)}</section></div></div>`;
}

export function renderChapters(chapters, questions, progress) {
  return `<div class="page"><header class="page-head"><div><p class="eyebrow">Chapters 7–11</p><h1 tabindex="-1">Chapters</h1></div><p class="muted head-summary">Open a chapter to see its topics and every question.</p></header>
    <ul class="plain chapter-grid">${chapterCards(chapters, questions, progress).map(chapterCard).join('')}</ul></div>`;
}

export function renderChapter(chapter, questions, progress) {
  const card = chapterCards([chapter], questions, progress)[0], pool = questions.filter(q => q.chapter === chapter.number);
  const started = t => t.correct + t.review > 0 ? 1 : 0;
  const topics = [...card.topics].sort((a, b) => b.review - a.review || started(b) - started(a) || a.readiness - b.readiness);
  const misses = pool.filter(q => cellState(q, progress) === 'review');
  const label = { correct: 'Correct', review: 'To review', unseen: 'Unseen' };
  const cell = q => { const s = cellState(q, progress), f = progress.flags.includes(q.id); return `<span class="qcell q-${s}${f ? ' flagged' : ''}" title="${q.id} · ${label[s]}${f ? ' · Flagged' : ''}"></span>`; };
  return `<div class="page chapter-page"><nav class="crumbs" aria-label="Breadcrumb"><ol><li>${action('Chapters', 'chapters', 'link')}</li><li aria-hidden="true">/</li><li><span aria-current="page">Chapter ${chapter.number}</span></li></ol></nav>
    <header class="card chapter-hero"><div class="hero-text"><p class="eyebrow mono">Chapter ${chapter.number} · ${plural(card.total, 'question')} · ${plural(card.topics.length, 'topic')}</p><h1 tabindex="-1">${escape(chapter.title)}</h1><p class="lede">${escape(chapter.subtitle || '')}</p>
      <div class="hero-progress"><div class="hero-line"><strong>${card.readiness}% ready</strong><span class="muted">${summary(card)}</span></div>${bar(card, 'thick')}</div></div>
      <div class="actions">${action(`Practice chapter · ${Math.min(10, card.total)}`, 'chapter-practice', 'primary large', chapter.number, 'data-nav')}${card.review ? action(`Review ${plural(card.review, 'miss', 'misses')}`, 'chapter-missed', 'ghost large', chapter.number, 'data-nav') : ''}</div></header>
    <div class="row top">
      <section class="card topics-card" aria-labelledby="topics-title"><div class="block-head pad"><h2 id="topics-title">Topics</h2><span class="muted small">Weakest first</span></div>
        <ul class="plain topics">${topics.map(t => `<li class="topic-row"><span class="topic-main"><strong>${escape(t.topic)}</strong><span class="muted small">${summary(t)}</span></span>${bar(t)}${action(`Practice ${t.total}`, 'topic', 'outline', `${chapter.number}:${t.topic}`, `data-nav aria-label="Practice ${escape(t.topic)}, ${plural(t.total, 'question')}"`)}</li>`).join('')}</ul></section>
      <div class="side-col"><section class="card map-card" aria-labelledby="map-title"><h2 id="map-title">Question map</h2><p class="muted small">One square per question, by topic</p>
        ${card.topics.map(t => `<div class="map-topic"><span class="mono muted small">${escape(t.topic)}</span><div class="qgrid" role="img" aria-label="${escape(t.topic)}: ${summary(t)}">${pool.filter(q => q.topic === t.topic).map(cell).join('')}</div></div>`).join('')}
        <p class="legend"><span><span class="swatch s-correct"></span>Correct</span><span><span class="swatch s-review"></span>To review</span><span><span class="swatch s-unseen"></span>Unseen</span><span><span class="swatch s-unseen flag-dot"></span>Flagged</span></p></section>
        <section class="card list-card" aria-labelledby="miss-title"><h2 id="miss-title">To review in this chapter</h2>${misses.length ? `<ul class="plain">${misses.slice(0, 5).map(q => `<li class="miss-item"><span class="miss-text"><span class="mono small review-text">${escape(q.topic)} · ${q.id}</span><span>${escape(q.prompt)}</span></span>${action('Retry', 'retry-one', 'outline', q.id, `aria-label="Retry ${q.id}"`)}</li>`).join('')}</ul>` : '<p class="muted empty">Nothing to review here yet.</p>'}</section></div></div></div>`;
}

export function renderHistory(progress) {
  const list = [...progress.history].reverse();
  return `<div class="page"><header class="page-head"><div><p class="eyebrow">Finished sessions</p><h1 tabindex="-1">History</h1></div><p class="muted head-summary">${plural(list.length, 'session')}</p></header>
    <section class="card list-card">${list.length ? `<ul class="plain">${list.map(s => `<li class="recent-item"><span class="recent-text"><strong>${escape(s.label)}</strong><span class="muted small">${new Date(s.finished).toLocaleString()} · ${plural(s.items.length, 'question')}</span></span><span class="mono score-pill">${scoreOf(s)}/${s.items.length}</span>${action('View results', 'history', 'outline', s.id)}</li>`).join('')}</ul>` : '<p class="muted empty">No finished sessions yet.</p>'}</section></div>`;
}

export function renderSettings({ progress, questions, storage, prefs, backups = [], archived = 0 }) {
  const select = (id, label, value, options) => `<label class="field">${label}<select id="${id}" data-pref>${options.map(([v, t]) => `<option value="${v}"${String(v) === String(value) ? ' selected' : ''}>${t}</option>`).join('')}</select></label>`;
  return `<div class="page settings"><header class="page-head"><div><p class="eyebrow">Settings</p><h1 tabindex="-1">Progress, backups, and defaults</h1></div></header>
    <section class="card panel" aria-labelledby="save-title"><h2 id="save-title">Saving</h2><p class="save-state save-${storage.tone}">${escape(storage.summary)}</p>${storage.detail ? `<p class="muted small">${escape(storage.detail)}</p>` : ''}
      <div class="actions">${action('Export progress', 'export', 'outline')}${storage.retry ? action('Try saving again', 'retry-storage', 'outline') : ''}${storage.adopt ? action('Start a new save…', 'adopt', 'outline') : ''}</div>
      <label class="field file-field">Import a progress backup<input id="import-progress" type="file" accept=".json,application/json"></label>
      ${backups.length ? `<h3>Preserved copies of earlier saves</h3><ul class="plain">${backups.map(b => `<li class="recent-item"><span>${new Date(b.at).toLocaleString()} · ${Math.max(1, Math.round(b.size / 1024))} KB</span>${action('Export copy', 'export-backup', 'link', b.name)}</li>`).join('')}</ul>` : ''}</section>
    <section class="card panel" aria-labelledby="sessions-title"><h2 id="sessions-title">Sessions</h2>
      ${progress.active ? `<p>${escape(progress.active.label)} · question ${progress.active.index + 1} of ${progress.active.items.length}</p>` : '<p class="muted">No session in progress.</p>'}
      ${archived ? `<p class="muted small">${plural(archived, 'earlier session')} from the midterm archive ${archived === 1 ? 'is' : 'are'} kept in your backup but not shown here.</p>` : ''}
      <div class="actions">${progress.active ? action('Resume session', 'resume', 'outline') : ''}${action('View history', 'history-list', 'outline')}${progress.flags.length ? action(`Practice ${plural(progress.flags.length, 'flagged question')}`, 'flags', 'outline') : ''}</div></section>
    <section class="card panel" aria-labelledby="defaults-title"><h2 id="defaults-title">Session defaults</h2><div class="options">
      ${select('length', 'Practice length', prefs.length, [[10, '10 questions'], [20, '20 questions'], [40, '40 questions'], ['all', 'All available']])}
      ${select('mock-length', 'Mock length', prefs.mockLength, [[20, '20 questions'], [40, '40 questions'], ['all', 'All available']])}
      ${select('minutes', 'Mock timer', prefs.minutes, [[0, 'No timer'], [15, '15 minutes'], [30, '30 minutes'], [60, '60 minutes']])}
      <label class="field">Exam date<input id="exam-date" type="date" value="${escape(prefs.examDate || '')}" data-pref></label></div>
      <p class="muted small">Sessions use at most the available questions. Mocks hold feedback until you submit.</p></section>
    <section class="card panel" aria-labelledby="look-title"><h2 id="look-title">Appearance</h2>${themeSwitch(prefs.theme || 'system')}<p class="muted small">Auto follows your device setting.</p></section>
    <section class="card panel" aria-labelledby="keys-title"><h2 id="keys-title">Keyboard</h2><p class="muted">A–D, T/F or 1–4 select an answer. Enter checks or continues. S skips, P goes back, R flags, W opens Why?. On a chapter page, arrow keys move between its buttons.</p></section>
    <section class="card panel" aria-labelledby="reset-title"><h2 id="reset-title">Reset</h2><p class="muted">Clears finals answers, sessions, and flags in this browser. Export first to keep them. Exam coverage, timing, and format are unspecified.</p><div class="actions">${action('Reset finals progress…', 'reset', 'danger')}</div></section></div>`;
}

function segment(item, bank, { mock, current }) {
  const q = bank.get(item.id), state = mock ? item.checked || item.draft !== null ? 'saved' : item.skipped ? 'skip' : '' :
    item.checked ? item.pick === q.answer ? 'ok' : 'bad' : item.skipped ? 'skip' : '';
  return `<li class="seg ${state}${current ? ' current' : ''}${item.flag ? ' flagged' : ''}"></li>`;
}
export function renderQuiz(session, question, { bank = null, similar = null, fresh = false } = {}) {
  const follow = session.followUp, item = follow || session.items[session.index], feedback = item.checked && (!session.mock || follow);
  const selected = follow ? item.draft ?? item.pick : session.draft ?? item.draft ?? item.pick, last = session.index === session.items.length - 1;
  const wrong = feedback && item.pick !== question.answer;
  const choices = item.order.map((choice, position) => {
    const correct = feedback && choice === question.answer, mine = feedback && choice === item.pick, bad = mine && !correct;
    const badge = question.type === 'true-false' ? question.choices[choice][0] : 'ABCD'[position];
    const why = bad && question.whyNot?.[choice];
    return `<li class="${correct ? 'is-correct' : ''}${bad ? ' is-wrong' : ''}"><button class="choice" type="button" data-action="pick" data-value="${choice}" aria-pressed="${selected === choice}" ${feedback ? 'disabled' : ''}${why ? ' aria-describedby="why-not"' : ''}>
      <span class="choice-key mono" aria-hidden="true">${badge}</span><span class="choice-body">${correct || bad ? `<span class="answer-status">${icon(correct ? 'check' : 'close', 15)}${correct ? (mine ? 'Your answer · Correct' : 'Correct answer') : 'Your answer · Incorrect'}</span>` : ''}<span class="choice-text">${escape(question.choices[choice])}</span>${why ? `<span class="why-not" id="why-not">${escape(why)}</span>` : ''}</span></button></li>`;
  }).join('');
  const strip = bank ? `<ol class="segments" aria-hidden="true">${session.items.map((i, n) => segment(i, bank, { mock: session.mock, current: n === session.index })).join('')}</ol>` : '<span></span>';
  let bottom;
  if (feedback) bottom = `<div class="feedback sheet${wrong ? ' is-wrong' : ' is-right'}" tabindex="-1" role="status"><div class="sheet-inner"><div class="sheet-row"><span class="verdict-icon" aria-hidden="true">${icon(wrong ? 'close' : 'check', 22)}</span>
      <div class="verdict"><h2>${wrong ? 'Not quite.' : 'Correct.'}</h2><p class="muted">${wrong ? 'Your choice and the correct answer are marked above.' : follow ? 'That idea is landing.' : 'Saved to your map as correct.'}</p></div>
      <div class="sheet-actions lesson-actions">${wrong && similar && !follow ? action('Try a similar one', 'similar', 'outline') : ''}<button type="button" class="button primary" data-action="next">${follow ? `Back to question ${session.index + 1}` : 'Continue'}</button></div></div>
      <details class="why"><summary>Why?${icon('chevron', 16)}</summary><div class="why-body"><p>${escape(question.explanation)}</p><p class="mono muted small">Source · Chapter ${question.chapter} · ${escape(question.reference)}</p></div></details>
      ${wrong && !follow && !similar ? '<p class="muted small no-similar">No similar question in the bank yet. This one stays on your review list.</p>' : ''}</div></div>`;
  else if (follow) bottom = `<div class="bar-bottom"><div class="bar-inner lesson-actions">${action(`Back to question ${session.index + 1}`, 'leave-follow', 'ghost')}<span class="spacer"></span><button type="button" class="button primary" data-action="next" ${selected === null ? 'disabled' : ''}>Check answer</button></div></div>`;
  else if (session.mock) bottom = `<div class="bar-bottom"><div class="bar-inner lesson-actions">${session.index > 0 ? action('Back', 'previous', 'ghost') : ''}${item.checked ? '' : action('Skip', 'skip', 'ghost')}<span class="spacer"></span>${action('Submit mock', 'submit', 'outline')}<button type="button" class="button primary" data-action="next">${last ? 'Save' : 'Save & next'}</button></div></div>`;
  else bottom = `<div class="bar-bottom"><div class="bar-inner lesson-actions">${action('End session…', 'submit', 'ghost')}<span class="spacer"></span>${session.index > 0 ? action('Back', 'previous', 'ghost') : ''}${action('Skip', 'skip', 'ghost')}<button type="button" class="button primary" data-action="next" ${selected === null ? 'disabled' : ''}>Check answer</button></div></div>`;
  const nav = session.mock && !follow ? `<details class="navigator card"><summary>All questions</summary><p class="muted small">Answers stay editable until you submit.</p>
      <div class="actions">${action('Next unanswered', 'next-unanswered', 'outline')}${action('Next flagged', 'next-flagged', 'outline')}</div><div class="question-grid">${session.items.map((i, n) => {
        const state = i.checked ? 'Saved' : i.draft !== null ? 'Selected' : i.skipped ? 'Skipped' : 'Unanswered';
        return `<button class="nav-question ${n === session.index ? 'current' : ''}" type="button" data-action="goto" data-value="${n}"${n === session.index ? ' aria-current="step"' : ''}>${n + 1}<small>${state}${i.flag ? ' · Flagged' : ''}</small></button>`;
      }).join('')}</div></details>` : '';
  return `<section class="lesson${fresh ? ' enter' : ''}${session.mock ? ' is-mock' : ''}"><header class="lesson-rail"><div class="rail-inner">
      <button type="button" class="icon-button" data-action="exit" aria-label="Save and exit">${icon('close', 20)}</button>${strip}<span class="count mono">${session.index + 1} of ${session.items.length}</span>
      ${follow ? '<span class="rail-spacer"></span>' : `<button type="button" class="button ghost flag-button" data-action="flag" aria-pressed="${item.flag}">${icon('flag', 18, item.flag ? 'fill="currentColor"' : '')}${item.flag ? 'Flagged' : 'Flag'}</button>`}</div></header>
    <div class="lesson-main">${follow ? `<p class="follow-note">Similar question · not part of this session’s score. Your place is saved at question ${session.index + 1}.</p>` : ''}
      <div class="lesson-body"><p class="chips"><span class="chip mono">Chapter ${question.chapter} · ${escape(question.topic)}</span><span class="chip mono">${question.type === 'true-false' ? 'True / False' : 'Single answer'}</span>${session.mock && !follow ? '<span class="chip mono">Mock</span>' : ''}<span id="timer" class="chip mono timer" role="timer" aria-label="Time remaining"></span></p>
      <h1 tabindex="-1">${escape(question.prompt)}</h1><ul class="plain choices" aria-label="Answers">${choices}</ul></div>${nav}</div>
    ${bottom}</section>`;
}

export function renderResults(result, recommendation, label = 'Session complete', { progress = null, chapters = [], questions = [], session = null } = {}) {
  const missed = result.entries.filter(e => e.status === 'answered' && !e.correct), answered = result.entries.filter(e => e.status === 'answered');
  const notReached = result.entries.filter(e => e.pick === null && !e.shown).length, share = result.total ? result.correct / result.total : 0;
  const r = 70, circ = 2 * Math.PI * r;
  const scoreRing = `<svg class="ring score-ring" width="168" height="168" viewBox="0 0 168 168" role="img" aria-label="${result.correct} of ${result.total} correct"><circle cx="84" cy="84" r="${r}" class="ring-track"/>${result.correct ? `<circle cx="84" cy="84" r="${r}" class="ring-correct" stroke-linecap="round" stroke-dasharray="${(share * circ).toFixed(1)} ${circ.toFixed(1)}" transform="rotate(-90 84 84)"/>` : ''}<text x="84" y="92" text-anchor="middle" class="ring-value big">${result.correct}/${result.total}</text><text x="84" y="116" text-anchor="middle" class="ring-label">correct</text></svg>`;
  const heading = !answered.length ? 'Nothing was answered' : !missed.length ? 'Everything you answered is correct' : missed.length === 1 ? 'Good work. One to fix.' : `${plural(missed.length, 'question')} to fix`;
  const strip = `<ol class="segments big" aria-hidden="true">${result.entries.map(e => `<li class="seg ${e.status === 'answered' ? e.correct ? 'ok' : 'bad' : e.status === 'skipped' ? 'skip' : ''}"></li>`).join('')}</ol>`;
  const follows = session?.followUps?.length ? `<p class="muted small">You also tried ${plural(session.followUps.length, 'similar question')} (${session.followUps.filter(f => f.correct).length} correct). ${session.followUps.length === 1 ? 'It is' : 'They are'} not part of this score.</p>` : '';
  let next;
  if (recommendation?.single) next = `<div class="next-text"><p class="eyebrow accent-text">Next step · ${escape(recommendation.topic)}</p><h2 id="next-title">Retry the ${plural(missed.length, 'question')} you missed</h2><p>You missed ${recommendation.missed} of ${recommendation.total} ${escape(recommendation.topic)} questions.</p></div>
      <div class="actions">${action(`Retry ${missed.length} missed`, 'retry', 'primary large')}${recommendation.conceptPool.length ? action('Try a fresh question on this idea', 'concept', 'ghost large') : ''}</div>`;
  else if (recommendation) next = `<div class="next-text"><p class="eyebrow accent-text">Next topic · Chapter ${recommendation.chapter}</p><h2 id="next-title">${escape(recommendation.topic)}</h2><p>You missed ${recommendation.missed} of ${recommendation.total} ${escape(recommendation.topic)} questions. ${recommendation.fresh ? `${plural(recommendation.pool.length, 'unseen question')} available.` : 'No unseen questions left on this topic, so you will revisit your misses.'}</p></div>
      <div class="actions">${action(`Practice ${recommendation.topic}`, 'follow-up', 'primary large')}${action(`Retry ${missed.length} missed`, 'retry', 'ghost large')}</div>`;
  else if (answered.length) next = `<div class="next-text"><h2 id="next-title">Keep it going</h2><p>Try a fresh mix across Chapters 7–11.</p></div><div class="actions">${action('Practice another 10', 'mixed', 'primary large')}</div>`;
  else next = `<div class="next-text"><h2 id="next-title">Start with a short mix</h2><p>Unanswered questions stay unseen on your map. They do not count as misses.</p></div><div class="actions">${action('Start mixed practice', 'mixed', 'primary large')}</div>`;
  const before = session?.before, touched = progress ? chapters.filter(ch => result.entries.some(e => e.question.chapter === ch.number)) : [];
  const overall = progress ? counts(questions, progress) : null;
  const change = touched.length ? `<section class="card ready-change" aria-labelledby="change-title"><div class="block-head"><h2 id="change-title">Readiness</h2><span>${before ? `<span class="muted">${Math.round(before.overall / overall.total * 100)}% →</span> ` : ''}<strong>${overall.readiness}%</strong></span></div>
      ${touched.map(ch => { const c = counts(questions.filter(q => q.chapter === ch.number), progress), b = before?.chapters?.[ch.number] ?? c.correct;
        return `<div class="change-row"><div class="hero-line small"><strong>Ch ${ch.number} · ${escape(ch.title)}</strong><span class="mono muted">${Math.round(b / c.total * 100)}% → ${c.readiness}%</span></div><span class="bar" aria-hidden="true"><span class="bar-correct" style="width:${(Math.min(b, c.correct) / c.total * 100).toFixed(1)}%"></span><span class="bar-gain" style="width:${(Math.max(0, c.correct - b) / c.total * 100).toFixed(1)}%"></span></span></div>`; }).join('')}
      <p class="muted small">${before ? 'Lighter segment = gained this session.' : 'Current readiness for the chapters in this session.'}</p></section>` : '';
  const review = result.entries.map(({ question: q, pick, correct, status }, n) => `<li><details${!correct && pick !== null && missed.length <= 3 ? ' open' : ''}><summary><span class="verdict-dot ${correct ? 'ok' : pick === null ? 'none' : 'bad'}" aria-hidden="true">${correct ? icon('check', 15) : pick === null ? '' : icon('close', 15)}</span><span class="review-head"><span class="mono muted small">Q${n + 1} · Ch ${q.chapter} · ${escape(q.topic)} · ${correct ? 'Correct' : pick === null ? status === 'skipped' ? 'Skipped' : 'Unanswered' : 'Incorrect'}</span><strong>${escape(q.prompt)}</strong></span></summary>
      <div class="review-body"><p>${pick !== null && !correct ? `<span class="muted">You chose</span> <strong>${escape(q.choices[pick])}</strong> · ` : ''}<span class="muted">Correct answer</span> <strong>${escape(q.choices[q.answer])}</strong></p>${!correct && pick !== null && q.whyNot?.[pick] ? `<p class="why-not">${escape(q.whyNot[pick])}</p>` : ''}<p>${escape(q.explanation)}</p><p class="mono muted small">Chapter ${q.chapter} · ${escape(q.reference)}</p></div></details></li>`).join('');
  return `<div class="page results"><div class="row">
      <section class="card score-card" aria-labelledby="score-title">${scoreRing}<div class="score-text"><p class="eyebrow">${escape(label)}</p><h1 id="score-title" class="visually-hidden" tabindex="-1">Session results</h1><h2 class="score-heading">${heading}</h2>
        <p class="muted">${missed.length} incorrect · ${result.unanswered} unanswered (${result.skipped} skipped${notReached ? `, ${notReached} not reached` : ''})</p>${strip}${follows}</div></section>${change}</div>
    <section class="card next-card" aria-labelledby="next-title">${next}</section>
    <section class="card review-card" aria-labelledby="review-title"><div class="block-head pad"><h2 id="review-title">Review all ${result.total} answers</h2><span class="muted small">${missed.length} missed</span></div><ol class="plain answer-review">${review}</ol></section>
    <div class="actions">${action('Back to Today', 'library', 'ghost')}</div></div>`;
}
