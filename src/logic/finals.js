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
  return { ...progress, first: keep(progress.first), latest: keep(progress.latest),
    flags: progress.flags.filter(id => isFinals(bank.get(id))), history,
    active: isFinalsSession(progress.active, bank) ? progress.active : null };
}
export function studyStatus(pool, progress) {
  const ids = new Set(pool.map(q => q.id)), practiced = new Set();
  for (const records of [progress.first, progress.latest]) {
    for (const [id, r] of Object.entries(records)) if (ids.has(id) && r.status === 'answered') practiced.add(id);
  }
  for (const session of [...progress.history, ...(progress.active && !progress.active.mock ? [progress.active] : [])]) {
    for (const item of session.items) if (ids.has(item.id) && item.checked && item.recorded) practiced.add(item.id);
  }
  const missed = pool.filter(q => progress.latest[q.id] && !progress.latest[q.id].correct).length;
  return { practiced: practiced.size, missed, total: pool.length,
    text: missed ? `${missed} to review` : practiced.size ? `${practiced.size} of ${pool.length} practiced` : 'Not started' };
}
export function resetFinalsProgress(progress, bank) {
  const archiveOnly = records => Object.fromEntries(Object.entries(records).filter(([id]) => !isFinals(bank.get(id))));
  const mixedHistory = progress.history.filter(s => s.items.some(i => isFinals(bank.get(i.id))) && s.items.some(i => !isFinals(bank.get(i.id))));
  return { ...progress, active: null, first: archiveOnly(progress.first), latest: archiveOnly(progress.latest),
    flags: progress.flags.filter(id => !isFinals(bank.get(id))),
    history: progress.history.filter(s => s.items.every(i => !isFinals(bank.get(i.id)))),
    // Keep original mixed attempts intact outside the finals view, including any archived answers.
    archivedSessions: [...(progress.archivedSessions || []), ...mixedHistory,
      ...(progress.active && !isFinalsSession(progress.active, bank) ? [progress.active] : [])] };
}
