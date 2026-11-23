export const isFinals = q => q && q.chapter >= 7 && q.chapter <= 11;
export function isFinalsSession(session, bank) {
  return !!session?.items?.length && session.items.every(item => isFinals(bank.get(item.id)));
}
// Keep incompatible active attempts intact, but never expose them through finals resume.
export function parkArchiveSession(progress, bank) {
  if (!progress.active || isFinalsSession(progress.active, bank)) return false;
  progress.archivedSessions ??= [];
  progress.archivedSessions.push(progress.active);
  progress.active = null;
  return true;
}
export function scopeProgress(progress, bank) {
  const keep = records => Object.fromEntries(Object.entries(records).filter(([id]) => isFinals(bank.get(id))));
  const history = progress.history.flatMap(session => {
    const items = session.items.filter(item => isFinals(bank.get(item.id)));
    if (!items.length) return [];
    return [{ ...session, items, label: items.length === session.items.length ? session.label : 'Finals questions from saved session' }];
  });
  return { ...progress, first: keep(progress.first), latest: keep(progress.latest), attempts: keep(progress.attempts || {}),
    flags: progress.flags.filter(id => isFinals(bank.get(id))), history,
    active: isFinalsSession(progress.active, bank) ? progress.active : null };
}
// Map state of one question: its latest real answer decides correct / to review; no answer means unseen.
// Flags are independent and never change this state.
export function cellState(q, progress) {
  const r = progress.latest[q.id];
  return r?.status === 'answered' ? r.correct ? 'correct' : 'review' : 'unseen';
}
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
export function studyStatus(pool, progress) {
  const ids = new Set(pool.map(q => q.id)), practiced = new Set();
  for (const records of [progress.first, progress.latest]) {
    for (const [id, r] of Object.entries(records)) if (ids.has(id) && r.status === 'answered') practiced.add(id);
  }
  for (const session of [...progress.history, ...(progress.active && !progress.active.mock ? [progress.active] : [])]) {
    for (const item of session.items) if (ids.has(item.id) && item.checked && item.recorded) practiced.add(item.id);
  }
  const states = pool.map(q => cellState(q, progress));
  const correct = states.filter(s => s === 'correct').length, missed = states.filter(s => s === 'review').length, unseen = states.filter(s => s === 'unseen').length;
  const flagged = pool.filter(q => progress.flags.includes(q.id)).length;
  const parts = [correct && `${correct} correct`, missed && `${missed} to review`, unseen && `${unseen} unseen`].filter(Boolean);
  return { practiced: practiced.size, missed, correct, unseen, flagged, total: pool.length,
    text: unseen === pool.length ? `Not started · ${plural(pool.length, 'question')}` : parts.join(' · ') };
}
export function resetFinalsProgress(progress, bank) {
  const archiveOnly = records => Object.fromEntries(Object.entries(records).filter(([id]) => !isFinals(bank.get(id))));
  const mixedHistory = progress.history.filter(s => s.items.some(i => isFinals(bank.get(i.id))) && s.items.some(i => !isFinals(bank.get(i.id))));
  return { ...progress, active: null, first: archiveOnly(progress.first), latest: archiveOnly(progress.latest), attempts: archiveOnly(progress.attempts || {}),
    flags: progress.flags.filter(id => !isFinals(bank.get(id))),
    history: progress.history.filter(s => s.items.every(i => !isFinals(bank.get(i.id)))),
    // Keep original mixed attempts intact outside the finals view, including any archived answers.
    archivedSessions: [...(progress.archivedSessions || []), ...mixedHistory,
      ...(progress.active && !isFinalsSession(progress.active, bank) ? [progress.active] : [])] };
}
