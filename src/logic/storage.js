import { recordItem } from './session.js';
export const key = 'smartprep-finals-v1';
export const freshProgress = () => ({ active: null, archivedSessions: [], latest: {}, first: {}, flags: [], retries: { total: 0, correct: 0 }, history: [] });
export function validSession(s, bank, finished = false) {
  if (!s || typeof s.id !== 'string' || typeof s.label !== 'string' || typeof s.mock !== 'boolean' ||
    !Number.isFinite(s.started) || !(s.deadline === null || Number.isFinite(s.deadline) && s.deadline >= s.started) ||
    !Array.isArray(s.items) || !s.items.length || s.items.length > bank.size || new Set(s.items.map(i => i?.id)).size !== s.items.length ||
    !Number.isInteger(s.index) || s.index < 0 || s.index >= s.items.length || finished && !Number.isFinite(s.finished)) return false;
  for (const item of s.items) {
    const q = bank.get(item?.id);
    if (!q || !Array.isArray(item.order) || item.order.length !== q.choices.length || new Set(item.order).size !== item.order.length ||
      !item.order.every(c => Number.isInteger(c) && c >= 0 && c < q.choices.length) ||
      q.type === 'true-false' && item.order.join() !== '0,1' ||
      !['checked','skipped','flag','recorded'].every(k => typeof item[k] === 'boolean') ||
      item.checked && item.skipped || !s.mock && item.checked && item.draft !== null ||
      !(item.checked ? item.order.includes(item.pick) : item.pick === null) ||
      !(item.draft === null || item.order.includes(item.draft))) return false;
  }
  return s.draft === s.items[s.index].draft && (s.draft === null || s.items[s.index].order.includes(s.draft));
}
function validOutcomes(records, bank) {
  return records && typeof records === 'object' && !Array.isArray(records) && Object.entries(records).every(([id, r]) =>
    bank.has(id) && r && typeof r.correct === 'boolean' && ['answered','skipped','unanswered'].includes(r.status) &&
    Number.isFinite(r.at) && !(r.correct && r.status !== 'answered'));
}
export function validateProgress(raw, bank) {
  if (!raw || raw.version !== 2 || !validOutcomes(raw.first, bank) || !validOutcomes(raw.latest, bank) ||
    !Array.isArray(raw.flags) || new Set(raw.flags).size !== raw.flags.length || raw.flags.some(id => !bank.has(id)) ||
    !Array.isArray(raw.history) || raw.history.length > 10000 || !raw.history.every(s => validSession(s, bank, true)) ||
    !(raw.active === null || validSession(raw.active, bank)) || !raw.retries ||
    raw.archivedSessions !== undefined && (!Array.isArray(raw.archivedSessions) || !raw.archivedSessions.every(s => validSession(s, bank))) ||
    !Number.isInteger(raw.retries.total) || !Number.isInteger(raw.retries.correct) || raw.retries.correct < 0 || raw.retries.total < raw.retries.correct ||
    new Set([...raw.history.map(s => s.id), ...(raw.active ? [raw.active.id] : [])]).size !== raw.history.length + (raw.active ? 1 : 0)) throw new Error('Invalid or incompatible progress backup.');
  return structuredClone({ active: raw.active, archivedSessions: raw.archivedSessions || [], latest: raw.latest, first: raw.first, flags: raw.flags, retries: raw.retries, history: raw.history });
}
function migrateV1(raw, bank) {
  const p = freshProgress();
  if (!raw.latest || typeof raw.latest !== 'object' || Array.isArray(raw.latest)) throw new Error('Invalid v1 save');
  for (const [id, correct] of Object.entries(raw.latest)) {
    if (!bank.has(id) || typeof correct !== 'boolean') throw new Error('Invalid v1 result');
    p.latest[id] = { correct, status: 'answered', at: 0 };
  }
  if (raw.active) {
    const s = raw.active;
    p.active = { ...s, id: 'starter-migration', started: Date.now(), deadline: null,
      items: s.items.map(i => ({ ...i, draft: null, skipped: false, flag: false, recorded: i.checked && !s.mock })) };
    p.active.items[s.index].draft = s.draft;
    if (!validSession(p.active, bank)) throw new Error('Invalid v1 session');
  }
  return p;
}
export function loadProgress(bank) {
  try {
    const data = localStorage.getItem(key);
    if (!data) return { progress: freshProgress(), writable: true };
    const raw = JSON.parse(data);
    return { progress: raw.version === 1 ? migrateV1(raw, bank) : validateProgress(raw, bank), writable: true };
  } catch { return { progress: freshProgress(), writable: false }; }
}
export function saveProgress(progress) {
  try { localStorage.setItem(key, JSON.stringify({ version: 2, ...progress })); return true; }
  catch { return false; }
}
export function importLegacy(raw, bank) {
  if (raw?.version !== 1 || !Array.isArray(raw.history) || raw.history.length > 10000) throw new Error('Expected a Study Studio v1 progress export.');
  const progress = freshProgress();
  if (!Array.isArray(raw.flags) || raw.flags.some(id => !bank.has(id) || bank.get(id).chapter > 6)) throw new Error('Invalid legacy flags.');
  progress.flags = [...new Set(raw.flags)];
  for (const old of raw.history) {
    if (!old || typeof old.id !== 'string' || typeof old.name !== 'string' || !['immediate','deferred'].includes(old.feedback) || !Array.isArray(old.ids) || !old.ids.length || new Set(old.ids).size !== old.ids.length ||
      old.ids.some(id => !bank.has(id) || bank.get(id).chapter > 6) || !Number.isFinite(old.started) || !Number.isFinite(old.finished) || !old.responses) throw new Error('Invalid legacy history.');
    const session = { id: old.id, label: old.name, mock: old.feedback === 'deferred', index: 0, draft: null,
      started: old.started, finished: old.finished, deadline: null, reason: 'legacy import', items: old.ids.map(id => {
        const r = old.responses[id];
        if (!r || !['answered','skipped','unanswered'].includes(r.status) || !Number.isFinite(r.at) ||
          (r.status === 'answered' ? typeof r.answer !== 'boolean' : r.answer !== null)) throw new Error('Invalid legacy response.');
        return { id, order: [0,1], pick: r.status === 'answered' ? Number(!r.answer) : null, draft: null, checked: r.status === 'answered',
          skipped: r.status === 'skipped', flag: Array.isArray(raw.flags) && raw.flags.includes(id), recorded: false };
      }) };
    if (!validSession(session, bank, true)) throw new Error('Invalid legacy session');
    progress.history.push(session);
  }
  const events = progress.history.flatMap((s, index) => s.items.map(i => ({s,i,at:raw.history[index].responses[i.id].at}))).sort((a,b) => a.at-b.at);
  for (const {s,i,at} of events) {
    const first = !progress.first[i.id];
    recordItem(progress,s,i,bank,true); progress.latest[i.id].at = at;
    if (first) progress.first[i.id].at = at;
  }
  if (raw.active) throw new Error('Finish the active Study Studio session before exporting legacy progress for import.');
  return validateProgress({version:2,...progress},bank);
}
