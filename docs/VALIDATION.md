# Validation record

## Commands and results

- `npm test` — **24 tests passed, zero failures** on Node v22.22.3. Its pretest step regenerated `offline/SmartPrep.html`.
- `npm run build` — produced a self-contained offline HTML file, approximately 478 KiB, containing eight bundled modules and both question banks.
- `npm run coverage` — generated coverage and source locators for 171 finals questions.
- `npm run import:midterm -- sources/study-studio/question-bank.json` — imported 442 archive questions, preserving IDs; tests verify uniqueness and provenance across all 613 questions.
- `node --check src/main.js` and `node --check src/views/screens.js` — passed.
- `npm run dev` — successfully served on `http://127.0.0.1:5173/`. HTTP checks returned 200 for the root page, controller, expanded-bank module, and stylesheet, and 404 for extracted course material and package metadata. The owned preview server was stopped after validation.
- `git diff --check` — no whitespace errors (Git reports the normal Windows LF/CRLF conversion advisory).

The tests are scoped to `tests/*.test.js`; ignored reference-project tests are not included in the 24-test result.

## Automated coverage

Bank: stable IDs, original starter ID inventory, 613 unique prompts/IDs across both banks, required fields and source references, both formats, four distinct MCQ options, canonical zero, True/False order, and per-chapter True/False proportions between 35% and 65% true. Counts are 32 / 32 / 32 / 38 / 37 finals questions by chapter.

Session logic: balanced quotas and sparse pools, no duplicates, deterministic seeds and display mappings, selection versus confirmation, fixed practice checks, editable mocks, deferred grading, navigation/draft restoration, distinct skipped/unanswered outcomes, first-attempt immutability, idempotent recording/finalization, correct retries clearing latest misses, unseen-topic recommendations/fallback, cram ordering, global flags, and six saved mocks with 120 unique questions and zero pairwise overlap.

Storage: valid round trips, absolute deadlines, flags and drafts, malformed saves, blocked reads/writes, duplicate items, invalid IDs/mappings, starter-v1 migration without invented first attempts, and separate legacy history import with retry chronology.

Controller/offline packaging: the actual generated script executes in Node’s isolated VM with a minimal DOM adapter. Tests exercise Start → Choose → Study → Results, chapter/mixed/mock starts, selecting/checking, skip/revisit, keyboard selection, save/exit/reload/resume, mock edit/cancel/submit/retry, empty review, replacement/history, timer expiry on reload and inside a confirmation dialog, in-memory fallback, backup validation/cancel/replacement, reset confirmation, and flag review/removal. The generated artifact has no external scripts or stylesheets and no remaining module imports.

Calculations: independently recomputed addressable word capacity, instruction field budgets, DRAM/CPU timing, pipeline fill, average cache access, DMA address ranges, bus unit conversion, average rotational latency, sector time, disk access/capacity, optical overhead, and framebuffer bytes.

## Browser checks — blocked, not passed

The browser access host was unavailable. Native Chrome automation was then denied with: **“Computer Use was not approved to use Google Chrome.”** No browser interaction, screenshot, mobile emulation, direct `file://` opening, screen-reader test, or browser-network-off test completed. VM tests are not browser tests and cannot establish rendered layout, actual focus behavior, or file-origin storage support.

Responsive breakpoints, wrapping, native controls, visible-focus rules, feedback words, and reduced-motion rules are implemented in CSS/markup, but their visual behavior is unverified.

## Remaining manual checklist

1. Double-click `offline/SmartPrep.html` in Chrome/Edge. Verify the four-screen path for both question types, explanations/citations after Check, keyboard T/F/A–D/1–4 and Tab/Enter, fixed checked answers, and stable row height on selection.
2. Verify at desktop size and 390×844 / 320×640: no horizontal page overflow, readable prompts and long answers, accessible navigator/table scrolling, usable sticky rail/actions, and visible focus. Check reduced motion.
3. In a mock, select/change answers, skip/revisit, save/exit, refresh/resume, cancel submission, then submit. Verify explanations appear only afterward and unanswered totals match.
4. Confirm file-origin saving and JSON download/import with actual browser file controls. Check reset/import cancellation. Verify separate server-origin/offline-origin progress using explicit export/import.
5. Disconnect networking and repeat a practice session from the single file. Check the browser network panel for no runtime dependency requests.
6. Check an absolute timer across refresh/backgrounding, including expiry while the submission dialog is open.

## Feature/source limits

No live hosting or accounts are included. Legacy progress import supports completed v1 history; active legacy attempts/settings are intentionally not restored and a non-null legacy active attempt is explicitly rejected. Outstanding assignment-specific ambiguities and excluded concepts are in SOURCE_ISSUES.md. The optional midterm archive was imported from the supplied reference project rather than reverified against its original fourteen course sources.

