// Smart review: a light spaced-repetition schedule built from each question's attempt history.
// An attempt is { at, correct, conf? } where conf is 'sure' | 'unsure' | 'guess' (optional).
//
// Stages (only questions you have missed or guessed are ever "in review"):
//   learning – the latest answer was wrong; due now
//   getting  – right since the last miss, but not yet 3 in a row over 2+ days; due in 1–2 days
//   solid    – 3 counted correct answers in a row since the last miss, on at least 2 different days
//   known    – never missed and never guessed; not scheduled
// A correct answer marked "guess" is neutral: it neither advances nor resets the streak.
// Questions missed more often come back sooner, and spacing tightens as the final gets closer.
const DAY = 86400000;
export const ATTEMPT_CAP = 30;
const dayStart = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
const dayKey = t => dayStart(t);

export function reviewState(list, now = Date.now(), examAt = null) {
  if (!list?.length) return { stage: 'unseen', lapses: 0, streak: 0, due: null, isDue: false };
  const lapses = list.filter(a => !a.correct).length, guesses = list.filter(a => a.correct && a.conf === 'guess').length;
  let streak = 0; const days = new Set();
  for (let i = list.length - 1; i >= 0; i--) {
    const a = list[i];
    if (!a.correct) break;
    if (a.conf === 'guess') continue;
    streak++; days.add(dayKey(a.at));
  }
  const last = list.at(-1);
  if (!lapses && !guesses) return { stage: 'known', lapses, streak, due: null, isDue: false, last: last.at };
  const stage = !last.correct ? 'learning' : streak >= 3 && days.size >= 2 ? 'solid' : 'getting';
  let due = null;
  if (stage === 'learning' || streak === 0) due = last.at;
  else if (stage === 'getting') {
    const base = streak === 1 ? 1 : 2;
    let gap = Math.max(1, Math.round(base / (1 + 0.5 * Math.max(0, lapses - 1))));
    if (examAt) gap = Math.min(gap, Math.max(1, Math.floor((examAt - now) / DAY / 2)));
    due = dayStart(last.at) + gap * DAY;
  } else {
    // Solid: one more look before the final, unless it was already confirmed in the last three days before it.
    due = dayStart(last.at) + 4 * DAY;
    if (examAt) { if (due >= dayStart(examAt)) due = last.at < examAt - 3 * DAY ? dayStart(examAt) - DAY : null; }
  }
  return { stage, lapses, streak, due, isDue: due !== null && due <= now, last: last.at };
}

export function reviewStates(questions, progress, now = Date.now(), examAt = null) {
  const out = new Map();
  for (const q of questions) out.set(q.id, reviewState(progress.attempts?.[q.id], now, examAt));
  return out;
}

// What is due now, most-missed first, then the oldest.
export function dueList(questions, progress, now = Date.now(), examAt = null) {
  const states = reviewStates(questions, progress, now, examAt);
  return questions.filter(q => states.get(q.id).isDue).map(q => ({ question: q, ...states.get(q.id) }))
    .sort((a, b) => b.lapses - a.lapses || a.due - b.due);
}

export function reviewSummary(questions, progress, now = Date.now(), examAt = null) {
  const states = [...reviewStates(questions, progress, now, examAt).values()];
  const count = stage => states.filter(s => s.stage === stage).length;
  return { due: states.filter(s => s.isDue).length, learning: count('learning'), getting: count('getting'), solid: count('solid'),
    trouble: states.filter(s => s.lapses >= 2 && s.stage !== 'solid').length };
}

// Weak spots: concepts with the highest miss rate (at least one miss), up to three of them.
export function weakConcepts(questions, progress, limit = 3) {
  const byConcept = Map.groupBy(questions.filter(q => q.concept), q => q.concept);
  return [...byConcept].map(([concept, qs]) => {
    const attempts = qs.flatMap(q => progress.attempts?.[q.id] || []), misses = attempts.filter(a => !a.correct).length;
    return { concept, questions: qs, misses, attempts: attempts.length, rate: attempts.length ? misses / attempts.length : 0, topic: qs[0].topic, chapter: qs[0].chapter };
  }).filter(c => c.misses > 0).sort((a, b) => b.rate - a.rate || b.misses - a.misses).slice(0, limit);
}
export function weakDrillPool(questions, progress, now = Date.now(), examAt = null, size = 10) {
  const concepts = weakConcepts(questions, progress), states = reviewStates(questions, progress, now, examAt);
  const rank = q => { const s = states.get(q.id); return s.isDue ? 0 : s.stage === 'unseen' ? 1 : s.stage === 'learning' || s.stage === 'getting' ? 2 : 3; };
  const pool = [...new Map(concepts.flatMap(c => c.questions).map(q => [q.id, q])).values()].sort((a, b) => rank(a) - rank(b));
  return { concepts, pool: pool.slice(0, size) };
}

// Rebuild attempt history for saves made before Smart review: finished sessions (in time order) and any
// answers already recorded in the active session. Mocks count only once submitted, exactly as before.
export function attemptsFromHistory(progress, bank) {
  const attempts = {};
  const push = (id, entry) => { (attempts[id] ||= []).push(entry); };
  const sessions = [...progress.history].sort((a, b) => a.finished - b.finished);
  for (const s of sessions) for (const item of s.items) if (item.checked && bank.has(item.id)) {
    const correct = item.pick === bank.get(item.id).answer;
    push(item.id, correct ? { at: s.finished, correct } : { at: s.finished, correct, pick: item.pick });
  }
  const active = progress.active;
  if (active && !active.mock) for (const item of active.items) if (item.checked && item.recorded && bank.has(item.id)) {
    const correct = item.pick === bank.get(item.id).answer, at = progress.latest[item.id]?.at || active.started;
    push(item.id, correct ? { at, correct } : { at, correct, pick: item.pick });
  }
  for (const id of Object.keys(attempts)) attempts[id] = attempts[id].slice(-ATTEMPT_CAP);
  return attempts;
}

export function validAttempts(raw, bank) {
  return raw && typeof raw === 'object' && !Array.isArray(raw) && Object.entries(raw).every(([id, list]) => bank.has(id) && Array.isArray(list) && list.length <= ATTEMPT_CAP &&
    list.every(a => a && Number.isFinite(a.at) && typeof a.correct === 'boolean' && (a.conf === undefined || ['sure', 'unsure', 'guess'].includes(a.conf)) &&
      (a.pick === undefined || Number.isInteger(a.pick) && a.pick >= 0 && a.pick < bank.get(id).choices.length)));
}

// Stage of each session question before it started, so results can say what moved.
export function stagesFor(ids, progress, now = Date.now(), examAt = null) {
  return Object.fromEntries(ids.map(id => [id, reviewState(progress.attempts?.[id], now, examAt).stage]));
}
