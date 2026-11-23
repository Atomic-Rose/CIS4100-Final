# SmartPrep · CIS 4100 Finals

Open [offline/SmartPrep.html](offline/SmartPrep.html) in a modern Chrome or Edge browser. The self-contained file has no external runtime dependencies. For the modular version, run `npm run dev` with Node 22+ and open the printed local URL. No package installation is needed.

## Nightly study loop

The start screen offers **Start studying**, or **Resume session** when a finals session is saved. Resume also has a quiet route to chapters.

The study screen gives one action primary weight, in this order: resume an unfinished finals session, review outstanding misses, or start mixed practice. Mock test remains a secondary action. The five chapter rows show Not started, a unique practiced count, or current misses. Opening a chapter shows Start practice and topic rows; selecting a topic immediately starts a focused session.

Default practice length is 10; default mixed mock length is 20. Sessions cap their size to available questions. Session length and optional timer are behind one Session options disclosure on the study/chapter screen. Mixed practice balances chapter coverage and prioritizes unseen questions within each chapter’s quota. Chapter and topic sessions remain in their selected scope.

Select an answer and then Check answer. Practice checks are scored immediately, fixed, and followed by a teaching explanation and source locator. Continue is the sole primary next action. Mock answers remain editable; explanations appear after submission. Back, Skip, and the question navigator support revisiting; the navigator can jump to the next unanswered or flagged question. The submission dialog states the total unanswered count, including skipped questions.

Results separate incorrect and unanswered outcomes, give an evidence-based topic recommendation, and offer Retry missed. The topic action prefers unseen questions and falls back to that session’s misses on the topic. Correct retries immediately clear the latest missed queue while preserving earlier outcomes in history. A perfect score offers another mixed practice session.

## Finals-only visibility and preservation

Every browsable chapter, topic, start action, review queue, recommendation, and visible progress total is limited to Chapters 7–11. **171 finals questions** remain, with original IDs and canonical answers preserved. Of these, 100 explanations, 53 MCQ option sets, and three prompts were revised in the second-pass audit.

The 442 historical midterm records remain intact in source and the offline artifact, solely to validate and preserve old data. They cannot be browsed or selected. A saved active session containing any midterm items is moved unchanged into `archivedSessions`, outside the finals resume action. Existing pure finals saves preserve their IDs, draft selections, current index, flags, deadline, and question/choice order. Mixed historical sessions expose only their finals items in history/results; original stored sessions remain intact.

Practiced means a unique question with a **scored answer**. Drafts, skips, unanswered outcomes, and unfinished mock answers do not count. Immediate practice checks do count before the session ends. History provides evidence of past scored answers even if a later attempt was left unanswered. Missed queues use the latest finalized/check outcome, including skips and unanswered items.

Progress & backups contains finals history, flagged review, export, import, and reset. Export includes archival data. Import validates before asking to replace current progress; keep an export if you need the previous backup. Reset clears visible finals progress while retaining archive records and parked sessions. Historical aggregate retry counters are retained for compatibility but are not displayed as finals totals.

Corrupt saves are left untouched until explicit reset/import. Blocked or full storage falls back to in-memory operation and export. File-origin and server-origin storage may differ; export/import explicitly when switching browsers, devices, or app locations.

Timers use absolute deadlines and finalize overdue sessions when JavaScript next runs, including after reload. A closed browser cannot execute code until reopened.

Keyboard: Tab/Enter operate native controls; T/F, A–D, and 1–4 select; Enter checks/continues from the prompt or feedback; S skips an unchecked item; P goes back; R flags. Inputs and confirmation dialogs preserve normal keyboard behavior.

## Development and evidence

```text
npm test
npm run build
npm run coverage
npm run dev
```

Tests rebuild the offline artifact first. All **36 tests pass**, including controller journeys, finals isolation, preservation of old saves, first/retry accounting, storage failure, and answer-manifest compatibility. The local preview at `http://127.0.0.1:3000/` was already running and returns the updated modular app. The bundled HTML is approximately 517 KiB.

See [second-pass audit](docs/SECOND_PASS.md), [coverage](docs/COVERAGE.md), [source map](docs/SOURCE_MAP.md), [source issues](docs/SOURCE_ISSUES.md), and [validation](docs/VALIDATION.md).

The three supplied screenshots were visually inspected. Live desktop/mobile browser QA remains unverified because browser access has been unavailable/restricted. Automated VM controller tests do not establish rendered layout, native focus behavior, or direct file-origin behavior. No changes were committed or published by this pass.
