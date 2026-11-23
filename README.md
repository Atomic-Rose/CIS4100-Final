# CIS 4100 Finals · Load what you know

A focused study site for Computer Organization Chapters 7–11. Open [offline/SmartPrep.html](offline/SmartPrep.html) in Chrome or Edge, or run `npm run dev` (Node 22+) and open the printed local URL. Nothing needs installing and nothing loads from the network at runtime.

## The flow

- **Welcome (first visit only).** "Load what you know." with one Start action, an optional exam date, and a preview of your five chapters. Anyone with finals progress opens straight on Today.
- **Today.** A card-based dashboard. **Today's session** is built for you: your 4 oldest misses first, then unseen questions from the started chapter with the most left (10 questions). Beside it, a readiness ring: the share of all 171 questions whose latest answer is correct. Then answered count, first-try accuracy, study streak (consecutive days with a real answer), exam countdown, five chapter cards, your review list with one-tap Retry, and recent sessions.
- **Chapters and chapter pages.** Each chapter page shows readiness, topics weakest first with Practice buttons, an aligned question map, and that chapter's misses. Arrow keys move between its buttons.
- **Question.** Practice checks immediately. Your choice and the correct answer are marked in their rows, and a wrong choice gets one sentence explaining that specific misconception. A feedback panel slides up from the bottom with **Why?** (full explanation and source, or press W), **Try a similar one** when the bank has an eligible question, and **Continue** as the primary action. A similar question is optional, unscored practice; your place, score, and question count are unchanged. Mocks keep feedback until submission and show **Submit mock** in the action bar.
- **Results.** Score ring and outcome strip, readiness before → after for each chapter in the session, one next step based only on answered misses, and every answer with its explanation.
- **Shell.** Sidebar on desktop, tab bar on phones. **Appearance** offers Auto (follows the device), Light, and Dark; the choice is saved per browser.
- **Phones.** Today compacts to a session card, a one-line readiness row, swipeable stats, a chapter list, one review row, and a Start button pinned above the tab bar. After a check, feedback arrives in a bottom sheet with a drag handle: collapsed it shows the verdict and buttons (your marked answer stays visible); drag or tap the handle, tap Why?, or press W to unfold the explanation in place.
- **Answer cards.** A press scales the card slightly; the selected card gets a filled letter key and a check mark that pops in, and Check answer wakes up. A correct answer pulses once (optional). A "Halfway there" / "Last question" note appears under the progress bar, and a keyboard hint sits under the answers on devices with a mouse.
- **Settings.** Grouped rows that apply instantly with a toast and **Undo**: a saving-health card (green dot, last saved), study defaults and exam date, theme preview cards (Auto, Light, Dark), switches for keyboard hints, celebrate correct answers and vibrate on check (Android), your data (history, flagged, export, import, preserved copies), and a separate danger zone for reset.

Every text colour pair meets WCAG 2.2 AA in both themes (checked automatically on every screen), states always carry a word as well as a colour, controls are at least 44 px where they are buttons, and motion stops under reduced-motion settings.

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
