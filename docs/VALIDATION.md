# Validation — Memory Map pass (2026-11-22)

## Automated

- `npm test`: **41 passed, 0 failed**. Pretest rebuilds `offline/SmartPrep.html` (757 KiB, 17 modules, both fonts inlined).
- New tests in `tests/app.test.js`:
  - the audit case (one correct answer, end early, empty mock) creates no misses;
  - a legacy save migrates, removing phantom misses, recovering the latest real answer from history, keeping first attempts, and keeping a backup copy;
  - wrong-answer rationale, similar question, unchanged score and place;
  - every distractor has a rationale and every question a concept;
  - record-by-record recovery, and a failed write that later succeeds.
- Existing tests were updated where the old rule was the defect. Skipped and unanswered items used to become `first`/`latest` misses, and recommendations used unanswered items.

## Browser (headless Chrome, throwaway profiles, dev server on port 5199)

67 of 67 scripted checks passed with no page errors. Viewports were 1280×900 desktop and 390×844 with mobile emulation.

- **Welcome:** no brand or header course code; one action; 5 rows and 171 cells; Geist loaded; action before the map on mobile; no horizontal scroll; the reveal is off under reduced motion.
- **Study map:** Chapter 9 opens to its topics with plain labels. Arrow keys move from the chapter row into its panel and topics. Enter toggles the row and keeps focus. No horizontal scroll on mobile.
- **Audit case:** only the one real answer is stored; results say nothing was answered; the hub shows no misses.
- **Legacy save:** Chapter 7 phantom misses are removed; the latest real DMA answer is recovered from history; first attempts and history are preserved; a backup copy is made; chapters 1–6 are absent.
- **DMA miss in Chapter 9 practice:** the chosen option's rationale is shown and others are hidden; Why? is collapsed; Continue is primary. Try a similar one gives a same-topic DMA question not in the session (C9-020 → C9-003). The follow-up survives a reload and returns to the same question. Session order and count are unchanged; results read 9 / 10, plus "You also tried 1 similar question".
- **Mobile action bar:** right after checking, the rationale and verdict sit above the bar. Opening Why? scrolls the explanation clear of it. At the end of the page the explanation is fully above it.
- **DMA-only session:** no similar question is eligible (all six are in the session), so Continue stays and the miss remains on the review list. Results offer "Retry the 1 question you missed", and the retry holds exactly that question.
- **Mock:** after a reload, position, draft, flag and skip are restored. Submit is in the main bar; there is no feedback before submission; only submitted answers become progress.
- **Storage:** blocked access shows an in-memory banner with Export. A malformed save is never overwritten while studying, and "Start a new save" copies it first. A save with one bad record is recovered with a notice. A failed write shows a retrying banner, then auto-recovers.
- **Offline file:** renders with Geist, has no external resources, and runs a session from `file://`.

## Not verified

- Physical phones (only emulation), Safari/Firefox, and screen-reader output.
- Export/import file dialogs in a real browser (covered by controller tests only).
- The 50 rationales listed in `docs/RATIONALES.md` still need a human source check.
