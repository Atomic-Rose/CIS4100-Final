export function seededRandom(seed) {
  let value = 2166136261;
  for (const char of String(seed)) value = Math.imul(value ^ char.charCodeAt(0), 16777619);
  return () => { value = (Math.imul(value, 1664525) + 1013904223) >>> 0; return value / 4294967296; };
}
export function shuffle(items, random = Math.random) {
  const order = [...items];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}
export function balancedSample(pool, size, random = Math.random) {
  const unique = [...new Map(pool.map(q => [q.id, q])).values()];
  const groups = Map.groupBy(shuffle(unique, random), q => q.chapter);
  const buckets = shuffle([...groups.values()], random), chosen = [];
  while (chosen.length < Math.min(size, unique.length)) {
    for (const bucket of buckets) if (bucket.length && chosen.length < size) chosen.push(bucket.pop());
  }
  return shuffle(chosen, random);
}
export function createSession(pool, { label = 'Practice', mock = false, size = pool.length, seed = `${Date.now()}-${Math.random()}`, minutes = 0, ordered = false } = {}) {
  const random = seededRandom(seed);
  const selected = ordered ? [...new Map(pool.map(q => [q.id, q])).values()].slice(0, size) : balancedSample(pool, size, random);
  if (!selected.length) return null;
  const started = Date.now();
  return { id: `${started}-${Math.random().toString(36).slice(2)}`, label, mock, seed: String(seed), started,
    deadline: minutes > 0 ? started + minutes * 60000 : null, index: 0, draft: null,
    items: selected.map(q => ({ id: q.id, order: q.type === 'true-false' ? [0, 1] : shuffle(q.choices.map((_, i) => i), random),
      pick: null, draft: null, checked: false, skipped: false, flag: false, recorded: false })) };
}
export function setDraft(session, pick) {
  const item = session.items[session.index];
  if (item.checked && !session.mock || !item.order.includes(pick)) return false;
  item.draft = pick; session.draft = pick; return true;
}
export function confirmCurrent(session) {
  const item = session.items[session.index], pick = session.draft ?? item.draft;
  if (pick === null || item.checked && !session.mock || !item.order.includes(pick)) return false;
  item.pick = pick; item.checked = true; item.skipped = false; item.draft = null; session.draft = null; return true;
}
export function navigate(session, index) {
  if (!Number.isInteger(index) || index < 0 || index >= session.items.length) return false;
  if (session.mock) confirmCurrent(session);
  session.index = index; session.draft = session.items[index].draft; return true;
}
export function score(session, bank) {
  const entries = session.items.map(item => {
    const question = bank.get(item.id), pick = item.checked ? item.pick : null;
    return { question, pick, correct: pick === question.answer, status: pick !== null ? 'answered' : item.skipped ? 'skipped' : 'unanswered' };
  });
  return { entries, correct: entries.filter(e => e.correct).length, unanswered: entries.filter(e => e.pick === null).length,
    skipped: entries.filter(e => e.status === 'skipped').length, total: entries.length };
}
export function recommend(entries, questions, seen = new Set()) {
  const missed = entries.filter(e => !e.correct);
  const topics = Map.groupBy(missed, ({ question: q }) => `${q.chapter}:${q.topic}`);
  const top = [...topics.values()].sort((a, b) => b.length - a.length)[0];
  if (!top) return null;
  const { chapter, topic } = top[0].question;
  const used = new Set([...seen, ...entries.map(e => e.question.id)]);
  const fresh = questions.filter(q => q.chapter === chapter && q.topic === topic && !used.has(q.id));
  return { chapter, topic, fresh: fresh.length > 0, pool: fresh.length ? fresh : top.map(e => e.question) };
}
export function recordItem(progress, session, item, bank, final = false) {
  if (item.recorded || !final && (session.mock || !item.checked)) return;
  const correct = item.checked && item.pick === bank.get(item.id).answer;
  const outcome = { correct, status: item.checked ? 'answered' : item.skipped ? 'skipped' : 'unanswered', at: Date.now() };
  if (!progress.first[item.id]) progress.first[item.id] = { ...outcome };
  else { progress.retries.total++; if (correct) progress.retries.correct++; }
  progress.latest[item.id] = outcome;
  item.recorded = true;
}
export function finishSession(progress, bank, reason = 'submitted') {
  const s = progress.active;
  if (!s) return null;
  if (s.mock) confirmCurrent(s);
  for (const item of s.items) recordItem(progress, s, item, bank, true);
  for (const item of s.items) item.draft = null;
  s.draft = null;
  s.finished = Date.now(); s.reason = reason;
  progress.history.push(structuredClone(s));
  progress.active = null;
  return score(s, bank);
}
export function savedMocks(pool, count = 6, size = 20) {
  if (!pool.length) return [];
  const random = seededRandom('CIS4100-mocks-v2');
  const groups = [...Map.groupBy(pool, q => q.chapter).values()].map(group => shuffle(group, random));
  const offsets = groups.map(() => 0), result = [];
  for (let m = 0; m < count; m++) {
    const used = new Set(), chosen = [];
    while (chosen.length < Math.min(size, pool.length)) {
      for (let g = 0; g < groups.length && chosen.length < size; g++) {
        const group = groups[g];
        if (group.every(q => used.has(q.id))) continue;
        let q;
        do { q = group[offsets[g]++ % group.length]; } while (used.has(q.id));
        chosen.push(q); used.add(q.id);
      }
    }
    result.push(shuffle(chosen, random));
  }
  return result;
}
export function mockOverlap(mocks) {
  const sets = mocks.map(pool => new Set(pool.map(q => q.id)));
  const unique = new Set(mocks.flat().map(q => q.id)).size;
  return { unique, reused: mocks.reduce((n, p) => n + p.length, 0) - unique,
    matrix: sets.map(a => sets.map(b => [...a].filter(id => b.has(id)).length)) };
}
export function cramPool(pool, latest) {
  const groups = [[], [], []];
  for (const q of pool) groups[latest[q.id] ? latest[q.id].correct ? 2 : 0 : 1].push(q);
  return groups.flatMap(group => shuffle(group));
}
