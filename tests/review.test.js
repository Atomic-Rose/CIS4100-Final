import { test } from 'node:test';
import assert from 'node:assert/strict';
import { questions } from '../src/data/questions.js';
import { archiveQuestions } from '../src/data/archive.js';
import { chapters } from '../src/data/chapters.js';
import { reviewState, dueList, reviewSummary, weakDrillPool, attemptsFromHistory, stagesFor } from '../src/logic/review.js';
import { createSession, setDraft, confirmCurrent, recordItem, finishSession, queueRepeat, nextRepeat, startFollowUp, endFollowUp, navigate, score } from '../src/logic/session.js';
import { freshProgress, validateProgress, validSession } from '../src/logic/storage.js';
import { renderMissSheet, renderReview, renderQuiz } from '../src/views/screens.js';
const bank = new Map([...questions, ...archiveQuestions].map(q => [q.id, q]));
const DAY = 86400000, t0 = new Date(2026, 10, 10, 10).getTime();
const at = d => t0 + d * DAY;

test('smart review: a miss is due now; one correct retry is not enough; 3 in a row over 2 days is solid', () => {
  let list = [{ at: at(0), correct: false }];
  assert.equal(reviewState(list, at(0)).stage, 'learning'); assert.equal(reviewState(list, at(0)).isDue, true);
  list.push({ at: at(0) + 3600000, correct: true });
  let s = reviewState(list, at(0) + 3600000); assert.equal(s.stage, 'getting'); assert.equal(s.isDue, false); assert.equal(reviewState(list, at(1)).isDue, true);
  list.push({ at: at(1), correct: true }); assert.equal(reviewState(list, at(1)).stage, 'getting');
  list.push({ at: at(3), correct: true }); assert.equal(reviewState(list, at(3)).stage, 'solid');
  list.push({ at: at(4), correct: false }); assert.equal(reviewState(list, at(4)).stage, 'learning'); assert.equal(reviewState(list, at(4)).lapses, 2);
});

test('smart review: three right answers on one day are not solid yet', () => {
  const list = [{ at: at(0), correct: false }, { at: at(0) + 1, correct: true }, { at: at(0) + 2, correct: true }, { at: at(0) + 3, correct: true }];
  assert.equal(reviewState(list, at(0) + 4).stage, 'getting');
});

test('smart review: a correct guess neither advances nor resets the streak', () => {
  const base = [{ at: at(0), correct: false }, { at: at(1), correct: true }];
  const guessed = [...base, { at: at(2), correct: true, conf: 'guess' }];
  assert.equal(reviewState(guessed, at(2)).streak, 1);
  assert.equal(reviewState([{ at: at(0), correct: true, conf: 'guess' }], at(0)).stage, 'getting');
  assert.equal(reviewState([{ at: at(0), correct: true }], at(0)).stage, 'known');
});

test('smart review: questions missed more often come back sooner, and spacing tightens near the exam', () => {
  const once = [{ at: at(0), correct: false }, { at: at(0) + 1, correct: true }, { at: at(1), correct: true }];
  const often = [{ at: at(-2), correct: false }, { at: at(-1), correct: false }, { at: at(0), correct: false }, { at: at(0) + 1, correct: true }, { at: at(1), correct: true }];
  assert.ok(reviewState(often, at(1)).due < reviewState(once, at(1)).due);
  const exam = at(3);
  assert.ok(reviewState(once, at(1), exam).due <= reviewState(once, at(1)).due);
});

test('smart review: due list puts the most-missed first and summary counts stages', () => {
  const [a, b, c] = questions, p = freshProgress();
  p.attempts[a.id] = [{ at: at(0), correct: false }];
  p.attempts[b.id] = [{ at: at(0), correct: false }, { at: at(0) + 1, correct: true }, { at: at(0) + 2, correct: false }];
  p.attempts[c.id] = [{ at: at(0), correct: true }];
  assert.deepEqual(dueList(questions, p, at(0) + 10).map(d => d.question.id), [b.id, a.id]);
  const sum = reviewSummary(questions, p, at(0) + 10); assert.equal(sum.due, 2); assert.equal(sum.learning, 2); assert.equal(sum.trouble, 1);
});

test('recording an answer stores the attempt with confidence and the wrong pick', () => {
  const q = questions.find(q => q.type === 'multiple-choice'), p = freshProgress(); p.active = createSession([q]);
  const wrong = (q.answer + 1) % 4; setDraft(p.active, wrong); p.active.items[0].conf = 'sure'; confirmCurrent(p.active); recordItem(p, p.active, p.active.items[0], bank);
  assert.deepEqual(p.attempts[q.id].map(a => ({ correct: a.correct, conf: a.conf, pick: a.pick })), [{ correct: false, conf: 'sure', pick: wrong }]);
  assert.deepEqual(validateProgress({ version: 3, ...p }, bank).attempts, p.attempts);
});

test('older saves get attempt history rebuilt from finished sessions', () => {
  const q = questions[0], p = freshProgress();
  p.active = createSession([q]); setDraft(p.active, (q.answer + 1) % q.choices.length); confirmCurrent(p.active); recordItem(p, p.active, p.active.items[0], bank); finishSession(p, bank);
  p.active = createSession([q]); setDraft(p.active, q.answer); confirmCurrent(p.active); recordItem(p, p.active, p.active.items[0], bank); finishSession(p, bank);
  const { attempts, ...old } = p;
  const migrated = validateProgress({ version: 3, ...old }, bank);
  assert.deepEqual(migrated.attempts[q.id].map(a => a.correct), [false, true]);
  assert.deepEqual(attemptsFromHistory(old, bank)[q.id].map(a => a.correct), [false, true]);
});

test('a practice miss comes back once as an unscored second look and the session stays valid', () => {
  const pool = questions.filter(q => q.chapter === 9).slice(0, 6), s = createSession(pool, { ordered: true }), p = freshProgress(); p.active = s;
  const q0 = bank.get(s.items[0].id);
  setDraft(s, (q0.answer + 1) % q0.choices.length); confirmCurrent(s); recordItem(p, s, s.items[0], bank);
  assert.ok(queueRepeat(s, q0.id)); assert.equal(queueRepeat(s, q0.id), false);
  for (let i = 1; i <= 2; i++) { navigate(s, i); assert.equal(nextRepeat(s), null); }
  navigate(s, 3); const r = nextRepeat(s); assert.equal(r.id, q0.id);
  const before = score(s, bank);
  assert.ok(startFollowUp(s, q0, Math.random, 'repeat')); assert.ok(validSession(s, bank));
  setDraft(s, q0.answer); confirmCurrent(s); recordItem(p, s, s.followUp, bank); endFollowUp(s, bank);
  assert.equal(nextRepeat(s), null); assert.deepEqual(score(s, bank), before);
  assert.deepEqual(s.followUps.map(f => [f.kind, f.correct]), [['repeat', true]]);
  assert.deepEqual(p.attempts[q0.id].map(a => a.correct), [false, true]);
  assert.ok(stagesFor([q0.id], p)[q0.id] === 'getting');
});

test('weak-spot drill targets the concepts with the highest miss rate', () => {
  const p = freshProgress(), dma = questions.filter(q => q.concept === 'dma-arbitration' || q.topic === 'DMA'), arb = questions.find(q => q.id === 'C9-020');
  p.attempts[arb.id] = [{ at: at(0), correct: false }, { at: at(1), correct: false }];
  p.attempts[questions[0].id] = [{ at: at(0), correct: false }, { at: at(1), correct: true }, { at: at(2), correct: true }, { at: at(3), correct: true }];
  const { concepts, pool } = weakDrillPool(questions, p, at(3));
  assert.equal(concepts[0].concept, arb.concept); assert.equal(pool[0].id, arb.id); assert.ok(dma.length > 0);
});

test('miss sheet lists unsolid misses with the answer, the wrong pick and why it was wrong', () => {
  const q = questions.find(q => q.id === 'C9-020'), p = freshProgress();
  p.attempts[q.id] = [{ at: at(0), correct: false, pick: 1 }];
  const html = renderMissSheet(chapters, questions, p, { now: at(0) });
  assert.ok(html.includes(q.prompt)); assert.ok(html.includes(q.choices[q.answer])); assert.ok(html.includes(q.whyNot[1])); assert.ok(html.includes('missed 1×'));
  const review = renderReview(questions, p, { now: at(0) });
  assert.ok(review.includes('data-action="review-due"')); assert.ok(review.includes('data-action="print-sheet"')); assert.ok(review.includes('data-action="drill"'));
});

test('confidence chips appear before checking in practice, not in mocks', () => {
  const q = questions[0];
  assert.ok(renderQuiz(createSession([q]), q).includes('data-action="conf"'));
  assert.ok(!renderQuiz(createSession([q], { mock: true }), q).includes('data-action="conf"'));
});
