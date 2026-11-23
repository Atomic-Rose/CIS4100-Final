# Validation — second pass

## Results actually obtained

- `npm test`: **36 passed, zero failures**. Pretest regenerated the self-contained offline artifact with ten modules, approximately 517 KiB.
- `npm run coverage`: regenerated locators and concept/exercise mapping for 171 finals records.
- `node --check src/main.js` and `node --check src/views/screens.js`: passed.
- Existing preview `http://127.0.0.1:3000/`: HTTP 200 for the root, controller, new finals-scope module, and stylesheet. This is the pre-existing VS Code preview; it was not started or stopped by this pass.
- `git diff --check`: checked for whitespace errors. Windows LF/CRLF advisories do not indicate a test failure.

The 24 pre-existing tests passed before edits. Their screen-label and chapter-navigation expectations were updated for the requested new flow; functional scoring/storage checks were retained. Twelve regression tests bring the current total to 36.

## Requested journeys exercised by the actual bundled controller

The controller is executed in an isolated Node VM with a minimal DOM adapter. These are integration checks of actual application code, **not browser tests**.

1. Fresh start → study screen → Chapter 9 → DMA. Scope is exactly Chapter 9/DMA and caps at six questions. Select/check reveals the corresponding explanation. Finish with misses, get session-specific DMA evidence, start retry, answer correctly, and verify latest missed clears while the first incorrect outcome/history remain.
2. Mock → flag → skip → save/reload → resume. Index, item order, choice order, skip, and flag survive. Jump to flagged, save an answer, return and edit it, submit, then see explanations and the final edited result.
3. Existing progress containing pure midterm history and a mixed active attempt. The original attempt is parked unchanged, the fresh start offers Start studying, all five chapter rows are finals, midterm records stay out of review counts, and a new mixed practice contains only finals IDs.
4. Existing pure finals active saves round-trip with session ID, absolute deadline, current question, draft, flag, and displayed mapping intact.

## Other regression coverage

- One primary decision in Start/Study/Chapter: resume before missed before mixed; topic rows start focused sessions.
- Practiced counts use distinct scored answers, never drafts, skips, unanswered outcomes, or unfinished mock picks. Repeated attempts do not inflate counts.
- Balanced practice gives unseen items priority within each chapter quota, avoids duplicates, and caps small pools.
- Recommendations show the session’s missed/total evidence; unseen topic pool and missed fallback are scoped correctly.
- Finals-only projections filter old first/latest records, flags, mixed history items, and aggregate totals without deleting archive data.
- Finals reset preserves archive records, flags, history, and parked attempts.
- All 171 IDs, question types, answer indexes, and correct choice texts match the pre-audit answer manifest. Every false finals statement now has an audited corrective explanation. Bank integrity and numerical checks remain in place.
- Existing immediate/deferred scoring, first/retry idempotence, corrected latest misses, draft navigation, timer expiry (including an open modal), no-pool handling, backup validation/confirmation, corrupt and blocked storage, and generated offline dependency checks pass.

## Visual/browser evidence and limitation

All three user-supplied screenshots were inspected before edits: oversized start typography, a long study selection screen with competing actions, and a selected True/False question. The redesign uses one 760px content width, smaller typography, compact divided rows, one primary decision, reserved feedback-label space, and a single-column quiz on desktop/mobile. CSS includes a 480px breakpoint, wrapping, visible focus, native controls, and reduced motion.

The final retry to open the updated preview in the in-app browser again returned “The browser access host is unavailable.” Native Chrome inspection then stopped because the tool could not establish the current Windows browser URL confidently enough to enforce policy. Consequently, **no live desktop/mobile screenshot or real browser journey is claimed as passed**. The actual preview responds over HTTP, but HTTP availability is not visual QA.

Remaining manual checks: open the updated modular/offline app at desktop, 390×844, and 320×640; run the three user journeys; verify no page overflow, readable long options, focus and Tab/Enter behavior, native file import/export, actual refresh persistence, reduced motion, and network-free use of the offline file. These limits do not affect the recorded automated results.
