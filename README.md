# SmartPrep · CIS 4100

Open [offline/SmartPrep.html](offline/SmartPrep.html) in Chrome or Edge. This single file includes the app, styles, and question banks. No server, internet connection, account, API key, or installation is needed to study.

Click **Start studying**, then a chapter, **Mixed practice**, or **Mock test**. Finals quick actions use Chapters 7–11. The separate, collapsed Chapters 1–6 archive is optional. The banks define study scope; exam coverage, timing, and format remain unspecified.

## Study flow

- Practice defaults to 10 questions; fresh mocks default to 20. Chapter/topic filters, other lengths, full-pool and cram practice, flags, an optional timer, and saved mocks sit under **More study options**.
- Select an answer, then **Check answer** in practice. The explanation and chapter-local source locator appear below the answer rows. A checked answer stays fixed. **Continue** advances.
- Mocks let you edit answers until final submission. **Save & next**, Back, or the navigator save a mock selection without revealing correctness. Explanations appear in results after submission.
- Skip clears an unchecked selection and leaves that question available in the navigator. Save & exit preserves drafts, question/choice order, flags, and the current position. Resume restores them. Starting another session asks before finalizing the old one into history.
- Results distinguish correct, incorrect, skipped, and unanswered outcomes. The next-topic action prefers globally unseen questions in the most-missed chapter/topic, then falls back to that topic’s misses. Retry missed includes unanswered items. Full answer review is expandable.
- Six saved finals mocks are deterministic: 20 questions each, four per chapter, 120 distinct questions and zero overlap. Their question order and displayed MCQ mapping repeat; timing is optional. The UI includes measured overlap.
- First attempts stay fixed. Later graded attempts count as retries. Latest missed review reflects the latest graded outcome; a correct retry clears that miss. Practice checks are recorded immediately, mocks only at finalization. Finalized skips/unanswered count as not correct.

**Keyboard:** Tab and Enter operate native controls. T/F, A–D, or 1–4 select answers. Enter checks or continues while the prompt/feedback has focus; Enter on a focused button activates that button. S skips an unchecked question, P goes back, R toggles its flag. Text inputs/selects and open confirmation dialogs do not intercept these shortcuts.

Progress, history, backups, import, and reset are in the collapsed **Progress, history & backups** section. Import validates first and asks before replacement; Reset also asks. A corrupt save is preserved until an explicit reset/import. If storage is blocked or full, study continues in memory and Export still works. Local-file storage can vary by browser and file location. Export before switching devices, browsers, or between the local server and offline file.

The optional timer stores an absolute deadline. It continues while away; an overdue session is finalized when JavaScript next runs, including on reload. A closed browser cannot run a timer until reopened.

## Content and provenance

There are **171 finals questions** (32 / 32 / 32 / 38 / 37 across Chapters 7–11), including the 40 unchanged starter IDs. Both True/False and four-choice single-answer formats are supported; True always precedes False. MCQ display order is shuffled and persisted independently of the canonical answer index, including index zero.

The optional archive includes **442 Study Studio questions**, with original IDs preserved. Content import is separate from progress import. `npm run import:midterm -- path/to/question-bank.json` regenerates archive content; the app’s separate legacy import accepts completed Study Studio v1 progress. Finish any active legacy session before exporting. Importing replaces current progress after confirmation; legacy settings are not imported.

All five supplied decks and five assignment PDFs were reviewed as sources. Original prompts include comparisons, instruction traces, field budgets, cache timing, bus throughput, disk capacity/latency, and display-size calculations. Ambiguous or slide-unsupported facts are excluded and documented; this is not an official assignment answer key.

See [coverage](docs/COVERAGE.md), [source map](docs/SOURCE_MAP.md), [source issues](docs/SOURCE_ISSUES.md), and [validation](docs/VALIDATION.md). Raw documents and extracted review artifacts are excluded from git and runtime.

## Development

Node 22+; no package install required:

```text
npm run dev
npm test
npm run build
npm run coverage
```

The server binds to `http://127.0.0.1:5173/` (`PORT` overrides it) and only serves app assets. `npm test` rebuilds the offline artifact before running the tests. `npm run build` regenerates `offline/SmartPrep.html`. `npm run coverage` regenerates the per-record coverage report.

Source is split into static HTML, CSS tokens/layout, data, pure session logic, storage validation, views, and a controller. The build script bundles these modules without dependencies. No changes have been published or committed by this task.

## Verification limits

24 automated tests currently pass. They include isolated execution of the actual bundled controller with a minimal DOM adapter. This verifies controller behavior and packaging, **not real browser rendering**. Desktop/mobile browser checks and direct file opening remain unverified: the browser connection was unavailable and native Chrome access was denied. See the validation checklist for remaining manual checks.
