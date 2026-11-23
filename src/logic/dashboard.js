import { cellState } from './finals.js';
import { shuffle } from './session.js';
// Pure numbers behind the Today dashboard. Every figure is derived from real answers only.
const pct = (n, total) => total ? Math.round(n / total * 100) : 0;
export function counts(pool, progress) {
  const states = pool.map(q => cellState(q, progress));
  const correct = states.filter(s => s === 'correct').length, review = states.filter(s => s === 'review').length;
  return { total: pool.length, correct, review, unseen: pool.length - correct - review, readiness: pct(correct, pool.length) };
}
export function chapterCards(chapters, questions, progress) {
  return chapters.map(ch => {
    const pool = questions.filter(q => q.chapter === ch.number), c = counts(pool, progress);
    const topics = [...Map.groupBy(pool, q => q.topic)].map(([topic, items]) => ({ topic, ...counts(items, progress) }));
    const weakest = topics.filter(t => t.review).sort((a, b) => b.review - a.review || a.readiness - b.readiness)[0];
    const next = topics.filter(t => t.unseen).sort((a, b) => b.unseen - a.unseen)[0];
    const note = weakest ? `Weakest topic: ${weakest.topic}` : c.correct + c.review === 0 ? `Start with ${topics[0].topic}` : next ? `Next up: ${next.topic}` : 'Every question answered correctly';
    return { ...ch, ...c, topics, note };
  });
}
// Today's session: the oldest misses first, then unseen questions from the started chapter that has the most left.
export function todayPlan(chapters, questions, progress, size = 10) {
  const cards = chapterCards(chapters, questions, progress);
  const review = questions.filter(q => cellState(q, progress) === 'review').sort((a, b) => progress.latest[a.id].at - progress.latest[b.id].at).slice(0, Math.min(4, size));
  const started = cards.filter(c => c.correct + c.review > 0 && c.unseen > 0).sort((a, b) => b.unseen - a.unseen || a.readiness - b.readiness);
  const focus = started[0] || null;
  const unseenPool = questions.filter(q => cellState(q, progress) === 'unseen' && (!focus || q.chapter === focus.number));
  const fresh = Math.min(size - review.length, unseenPool.length);
  const reviewTopics = [...new Set(review.map(q => q.topic))];
  let title;
  if (review.length && fresh && focus) title = `Fix ${review.length} ${review.length === 1 ? 'miss' : 'misses'}, then ${fresh} new from ${focus.title}`;
  else if (review.length && fresh) title = `Fix ${review.length} ${review.length === 1 ? 'miss' : 'misses'}, then ${fresh} new questions`;
  else if (review.length) title = `Fix your ${review.length} oldest ${review.length === 1 ? 'miss' : 'misses'}`;
  else if (focus) title = `${fresh} new questions from ${focus.title}`;
  else if (fresh) title = `Start with ${fresh} questions across all five chapters`;
  else title = 'Everything answered correctly. Keep it fresh with mixed practice';
  return { title, review, unseenPool, fresh, focus, reviewTopics, total: review.length + fresh };
}
export function pickPlan(plan, random = Math.random) {
  return [...plan.review, ...(plan.focus ? shuffle(plan.unseenPool, random).slice(0, plan.fresh) : balancedUnseen(plan.unseenPool, plan.fresh, random))];
}
function balancedUnseen(pool, n, random) {
  const groups = [...Map.groupBy(shuffle(pool, random), q => q.chapter).values()], out = [];
  while (out.length < n && groups.some(g => g.length)) for (const g of groups) if (g.length && out.length < n) out.push(g.pop());
  return out;
}
export function firstTry(questions, progress) {
  const ids = new Set(questions.map(q => q.id)), firsts = Object.entries(progress.first).filter(([id, r]) => ids.has(id) && r.status === 'answered');
  return { answered: firsts.length, correct: firsts.filter(([, r]) => r.correct).length, rate: pct(firsts.filter(([, r]) => r.correct).length, firsts.length) };
}
const day = t => { const d = new Date(t); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
// Local days with at least one real answer (from latest outcomes and finished sessions).
function studyDays(questions, progress) {
  const ids = new Set(questions.map(q => q.id)), days = new Set();
  for (const [id, r] of Object.entries(progress.latest)) if (ids.has(id) && r.status === 'answered' && r.at > 0) days.add(day(r.at));
  for (const s of progress.history) if (s.items.some(i => i.checked && ids.has(i.id))) days.add(day(s.finished));
  return days;
}
// Monday-to-Sunday view of the current week for the "This week" panel.
export function weekDays(questions, progress, now = Date.now()) {
  const days = studyDays(questions, progress), today = new Date(now), dow = (today.getDay() + 6) % 7;
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() - dow + i);
    return { letter: 'MTWTFSS'[i], name: d.toLocaleDateString(undefined, { weekday: 'long' }), studied: days.has(day(d.getTime())), today: i === dow, future: i > dow };
  });
}
// Questions whose latest answer is correct and was given in the last 7 days.
export function correctThisWeek(questions, progress, now = Date.now()) {
  const ids = new Set(questions.map(q => q.id)), since = now - 7 * 86400000;
  return Object.entries(progress.latest).filter(([id, r]) => ids.has(id) && r.status === 'answered' && r.correct && r.at >= since).length;
}
// Consecutive local days with at least one real answer, ending today (or yesterday, so the streak survives until tonight).
export function streak(questions, progress, now = Date.now()) {
  const days = studyDays(questions, progress);
  let cursor = new Date(now), count = 0, today = days.has(day(now));
  if (!today) cursor.setDate(cursor.getDate() - 1);
  while (days.has(day(cursor.getTime()))) { count++; cursor.setDate(cursor.getDate() - 1); }
  return { days: count, today };
}
export function examCountdown(examDate, now = Date.now()) {
  if (!examDate || !/^\d{4}-\d{2}-\d{2}$/.test(examDate)) return null;
  const [y, m, d] = examDate.split('-').map(Number), exam = new Date(y, m - 1, d), start = new Date(now); start.setHours(0, 0, 0, 0);
  const days = Math.round((exam - start) / 86400000);
  return { days, label: exam.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }) };
}
export function reviewList(questions, progress, limit = 3) {
  return questions.filter(q => cellState(q, progress) === 'review').sort((a, b) => progress.latest[b.id].at - progress.latest[a.id].at).slice(0, limit)
    .map(q => ({ question: q, at: progress.latest[q.id].at }));
}
export function ago(t, now = Date.now()) {
  const days = Math.round((new Date(now).setHours(0, 0, 0, 0) - new Date(t).setHours(0, 0, 0, 0)) / 86400000);
  return days <= 0 ? 'today' : days === 1 ? 'yesterday' : days < 7 ? `${days} days ago` : new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}
// Snapshot stored on a session when it starts, so results can show what changed.
export function snapshot(chapters, questions, progress) {
  return { overall: counts(questions, progress).correct, chapters: Object.fromEntries(chapters.map(ch => [ch.number, counts(questions.filter(q => q.chapter === ch.number), progress).correct])) };
}
