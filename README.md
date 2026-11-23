# CIS 4100 Finals · Load what you know

A focused study site for Computer Organization Chapters 7–11. Open [offline/SmartPrep.html](offline/SmartPrep.html) in Chrome or Edge, or run `npm run dev` (Node 22+) and open the printed local URL. Nothing needs installing and nothing loads from the network at runtime.

## The flow

- **Welcome.** "Load what you know." with one Start or Resume action and a five-row map of the real bank: one cell per question, grouped by topic. On mobile the action comes before the map.
- **Study map.** The same map becomes the hub. Open a chapter to see its topics, their question cells, and a Practice button for each topic. Chapter rows and topic buttons are native buttons; arrow keys move between them. The primary action is Resume, then Review missed questions, then Mixed practice. Mock test, flagged review, and Settings stay secondary.
- **Question.** Practice checks immediately. Your choice and the correct answer are marked in their rows, and a wrong choice gets one sentence explaining that specific misconception. The full explanation, worked steps, and source locator are behind **Why?** (or press W). **Continue** is always the primary action. **Try a similar one** appears after a miss when the bank has an eligible question: same concept first, then same topic, never one already in the session. It is optional, unscored practice; your place, score, and question count in the original session are unchanged. Mocks keep feedback until submission and show **Submit mock** in the main action bar.
- **Results.** Score, a strip of every outcome, and a next step based only on answered misses. A single-topic session points at retrying those misses or a fresh question on the missed concept. The chapter rows below show which cells changed.
- **Settings.** Saving status, export/import, preserved copies of earlier saves, resume and history, flagged review, session defaults, keyboard help, and reset.

## What counts as progress

Only a checked practice answer or a submitted mock answer updates first attempt, latest answer, and review status. Skipped, unanswered, and never-reached questions appear in that session's results but never create a miss, never replace a real answer, never count as practiced, and stay eligible for unseen-first sampling. This holds for submit, End session, starting a new session over an active one, and timer expiry.

Map states come from the latest real answer: **Correct**, **To review**, or **Unseen**. Flags are independent of correctness.

Older saves are migrated on load. Legacy `skipped`/`unanswered` records are replaced by the most recent (latest) or earliest (first) answer that session history supports, or removed. History itself is unchanged, and a one-time copy of the original payload is kept under Settings → Preserved copies. Chapters 1–6 records stay in the save for compatibility but are excluded from every finals view and calculation.

## Saving

| Situation | What happens |
| --- | --- |
| Storage blocked by the browser | Banner: progress is in memory only. Export is offered. Nothing is written. |
| Saved data is not valid JSON | Left untouched, and the visit runs in memory. Settings → Start a new save copies it aside first. |
| Some records invalid | Valid records are kept, the original is copied aside, and a notice says how many records were dropped. |
| A write fails (e.g. quota) | Banner says it is retrying. Retries every 4 s, on the next change, and when the tab regains focus. The last good save is never replaced by anything unreadable. |

The offline file and the local server are different browser origins and keep separate saves. Use Export/Import to move between them.

## Wrong-answer rationales

All 171 finals questions have a concept tag and a one-sentence rationale per wrong choice: 357 lines in `src/data/rationales/`. They were drafted from the slide and assignment text in `sources/`; [docs/RATIONALES.md](docs/RATIONALES.md) lists the 50 that still need a source check. Question IDs, choices, and answers are unchanged.

## Development

```text
npm test                         # rebuilds the offline file, then 41 tests
npm run build                    # offline/SmartPrep.html with fonts inlined
npm run dev                      # local server
node scripts/report-rationales.mjs
```

Type: Geist and Geist Mono (SIL OFL 1.1, `styles/fonts/`). See [validation](docs/VALIDATION.md), [coverage](docs/COVERAGE.md), [source map](docs/SOURCE_MAP.md), and [source issues](docs/SOURCE_ISSUES.md).
