import { recordItem } from './session.js';
import { attemptsFromHistory, validAttempts } from './review.js';
export const key = 'smartprep-finals-v1';
// Reading window.localStorage can itself throw (site data blocked), so it is only touched inside try blocks.
const defaultStorage = () => { try { return globalThis.localStorage; } catch { return { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }, get length() { throw new Error('blocked'); } }; } };
export const backupPrefix = `${key}.backup-`;
export const freshProgress = () => ({ active: null, archivedSessions: [], latest: {}, first: {}, flags: [], retries: { total: 0, correct: 0 }, history: [], attempts: {} });
function validItem(item, q, mock) {
  return q && Array.isArray(item.order) && item.order.length === q.choices.length && new Set(item.order).size === item.order.length &&
    item.order.every(c => Number.isInteger(c) && c >= 0 && c < q.choices.length) &&
    !(q.type === 'true-false' && item.order.join() !== '0,1') &&
    ['checked','skipped','flag','recorded'].every(k => typeof item[k] === 'boolean') && (item.shown === undefined || typeof item.shown === 'boolean') &&
    !(item.checked && item.skipped) && !(!mock && item.checked && item.draft !== null) &&
    (item.checked ? item.order.includes(item.pick) : item.pick === null) &&
    (item.draft === null || item.order.includes(item.draft));
}
export function validSession(s, bank, finished = false) {
  if (!s || typeof s.id !== 'string' || typeof s.label !== 'string' || typeof s.mock !== 'boolean' ||
    !Number.isFinite(s.started) || !(s.deadline === null || Number.isFinite(s.deadline) && s.deadline >= s.started) ||
    !Array.isArray(s.items) || !s.items.length || s.items.length > bank.size || new Set(s.items.map(i => i?.id)).size !== s.items.length ||
    !Number.isInteger(s.index) || s.index < 0 || s.index >= s.items.length || finished && !Number.isFinite(s.finished)) return false;
  for (const item of s.items) if (!item || !validItem(item, bank.get(item.id), s.mock)) return false;
  if (s.followUps !== undefined && (!Array.isArray(s.followUps) || !s.followUps.every(f => f && bank.has(f.id) && typeof f.correct === 'boolean'))) return false;
  if (s.followUp != null) {
    const f = s.followUp;
    // A "second look" repeats a question from this session; a similar question must be a different one.
    if (finished || s.mock || !validItem(f, bank.get(f.id), false) || (f.kind !== 'repeat' && s.items.some(i => i.id === f.id))) return false;
  }
  return s.draft === s.items[s.index].draft && (s.draft === null || s.items[s.index].order.includes(s.draft));
}
// Legacy saves may contain 'skipped' and 'unanswered' outcomes; they are accepted here and removed by migrateOutcomes.
const validOutcome = (id, r, bank) => bank.has(id) && r && typeof r.correct === 'boolean' && ['answered','skipped','unanswered'].includes(r.status) &&
  Number.isFinite(r.at) && !(r.correct && r.status !== 'answered');
function validOutcomes(records, bank) {
  return records && typeof records === 'object' && !Array.isArray(records) && Object.entries(records).every(([id, r]) => validOutcome(id, r, bank));
}
const validRetries = r => r && Number.isInteger(r.total) && Number.isInteger(r.correct) && r.correct >= 0 && r.total >= r.correct;
// Strict validation, used for imported backups: all or nothing.
export function validateProgress(raw, bank) {
  if (!raw || ![2,3].includes(raw.version) || !validOutcomes(raw.first, bank) || !validOutcomes(raw.latest, bank) ||
    !Array.isArray(raw.flags) || new Set(raw.flags).size !== raw.flags.length || raw.flags.some(id => !bank.has(id)) ||
    !Array.isArray(raw.history) || raw.history.length > 10000 || !raw.history.every(s => validSession(s, bank, true)) ||
    !(raw.active === null || validSession(raw.active, bank)) || !validRetries(raw.retries) ||
    raw.archivedSessions !== undefined && (!Array.isArray(raw.archivedSessions) || !raw.archivedSessions.every(s => validSession(s, bank))) ||
    new Set([...raw.history.map(s => s.id), ...(raw.active ? [raw.active.id] : [])]).size !== raw.history.length + (raw.active ? 1 : 0)) throw new Error('Invalid or incompatible progress backup.');
  if (raw.attempts !== undefined && !validAttempts(raw.attempts, bank)) throw new Error('Invalid or incompatible progress backup.');
  const progress = structuredClone({ active: raw.active, archivedSessions: raw.archivedSessions || [], latest: raw.latest, first: raw.first, flags: raw.flags, retries: raw.retries, history: raw.history, attempts: raw.attempts || {} });
  migrateOutcomes(progress, bank);
  // Saves from before Smart review: rebuild per-question history from finished sessions.
  if (raw.attempts === undefined) progress.attempts = attemptsFromHistory(progress, bank);
  return progress;
}
// Record-by-record recovery for a damaged save: keep everything that is individually valid and count the rest.
export function recoverProgress(raw, bank) {
  const p = freshProgress(); let dropped = 0;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { progress: p, dropped: 1, kept: 0 };
  for (const field of ['first','latest']) {
    const records = raw[field];
    if (!records || typeof records !== 'object' || Array.isArray(records)) { if (records !== undefined) dropped++; continue; }
    for (const [id, r] of Object.entries(records)) validOutcome(id, r, bank) ? p[field][id] = structuredClone(r) : dropped++;
  }
  const ids = new Set();
  for (const s of Array.isArray(raw.history) ? raw.history.slice(-10000) : []) validSession(s, bank, true) && !ids.has(s.id) ? (ids.add(s.id), p.history.push(structuredClone(s))) : dropped++;
  if (raw.active != null) validSession(raw.active, bank) && !ids.has(raw.active.id) ? p.active = structuredClone(raw.active) : dropped++;
  for (const s of Array.isArray(raw.archivedSessions) ? raw.archivedSessions : []) validSession(s, bank) ? p.archivedSessions.push(structuredClone(s)) : dropped++;
  for (const id of Array.isArray(raw.flags) ? raw.flags : []) bank.has(id) && !p.flags.includes(id) ? p.flags.push(id) : dropped++;
  if (validRetries(raw.retries)) p.retries = { ...raw.retries }; else dropped++;
  const kept = Object.keys(p.first).length + Object.keys(p.latest).length + p.history.length + (p.active ? 1 : 0) + p.flags.length;
  migrateOutcomes(p, bank);
  if (validAttempts(raw.attempts, bank)) p.attempts = structuredClone(raw.attempts);
  else { if (raw.attempts !== undefined) dropped++; p.attempts = attemptsFromHistory(p, bank); }
  return { progress: p, dropped, kept };
}
// Only real answers are progress. Legacy 'skipped'/'unanswered' records are replaced by the most recent (latest)
// or earliest (first) answered outcome that session history supports, or removed. History itself is untouched.
export function migrateOutcomes(progress, bank) {
  const events = new Map();
  for (const s of [...progress.history].sort((a, b) => a.finished - b.finished))
    for (const item of s.items) if (item.checked && bank.has(item.id))
      (events.get(item.id) || events.set(item.id, []).get(item.id)).push({ correct: item.pick === bank.get(item.id).answer, status: 'answered', at: s.finished });
  let changed = 0;
  for (const [field, choose] of [['latest', list => list.at(-1)], ['first', list => list[0]]]) {
    for (const [id, r] of Object.entries(progress[field])) {
      if (r.status === 'answered') continue;
      const found = events.get(id); changed++;
      if (found) progress[field][id] = { ...choose(found) }; else delete progress[field][id];
    }
  }
  return changed;
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
// Writes a copy of a payload under a timestamped backup key. Returns the key or null.
export function preserveCopy(text, storage = defaultStorage()) {
  try { const name = `${backupPrefix}${Date.now()}`; storage.setItem(name, text); return storage.getItem(name) === text ? name : null; }
  catch { return null; }
}
export function listBackups(storage = defaultStorage()) {
  try {
    const names = [];
    for (let i = 0; i < storage.length; i++) { const name = storage.key(i); if (name?.startsWith(backupPrefix)) names.push(name); }
    return names.sort().reverse().map(name => ({ name, at: Number(name.slice(backupPrefix.length)), size: storage.getItem(name)?.length || 0 }));
  } catch { return []; }
}
/*
 * status:
 *  'ok'         saved data loaded (possibly migrated) and safe to write
 *  'empty'      no save yet
 *  'recovered'  damaged save; valid records kept, original copied to a backup key first
 *  'unreadable' damaged save that could not be fully recovered AND could not be copied: never overwritten automatically
 *  'blocked'    the browser refused storage access: nothing can be read or written
 */
export function loadProgress(bank, storage = defaultStorage()) {
  let data;
  try { data = storage.getItem(key); } catch (error) { return { progress: freshProgress(), status: 'blocked', writable: false, detail: error?.name || 'Error' }; }
  if (!data) return { progress: freshProgress(), status: 'empty', writable: true };
  let raw;
  // Nothing in an unparseable save can be recovered, so it is never overwritten automatically.
  // Settings → "Start a new save" copies it to a backup key first (see adoptUnreadable).
  try { raw = JSON.parse(data); } catch { return { progress: freshProgress(), status: 'unreadable', writable: false, dropped: 1, kept: 0, detail: 'not valid JSON' }; }
  try {
    if (raw?.version === 1) return { progress: migrateV1(raw, bank), status: 'ok', writable: true, migrated: 1 };
    const progress = validateProgress(raw, bank), legacy = JSON.stringify(progress.latest) !== JSON.stringify(raw.latest) || JSON.stringify(progress.first) !== JSON.stringify(raw.first);
    // A save rewritten by migration keeps a one-time copy of the original payload.
    const backup = legacy ? preserveCopy(data, storage) : null;
    return { progress, status: 'ok', writable: true, migrated: legacy ? 1 : 0, backup };
  } catch {
    const { progress, dropped, kept } = recoverProgress(raw, bank);
    const copy = preserveCopy(data, storage);
    return { progress, status: copy ? 'recovered' : 'unreadable', writable: !!copy, dropped, kept, backup: copy, detail: 'some records failed validation' };
  }
}
export function adoptUnreadable(storage = defaultStorage()) {
  try { const data = storage.getItem(key); return data ? preserveCopy(data, storage) : 'none'; } catch { return null; }
}
export function saveProgress(progress, storage = defaultStorage()) {
  try { storage.setItem(key, JSON.stringify({ version: 3, ...progress })); return true; }
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
    if (!i.checked) continue;
    const first = !progress.first[i.id];
    recordItem(progress,s,i,bank,true); progress.latest[i.id].at = at;
    if (first) progress.first[i.id].at = at;
  }
  if (raw.active) throw new Error('Finish the active Study Studio session before exporting legacy progress for import.');
  return validateProgress({version:3,...progress},bank);
}
