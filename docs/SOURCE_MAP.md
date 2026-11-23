# Source map

Course sources are read-only inputs in the user’s Downloads directory. Raw PDFs/PPTX files, extracted text, copied reference checkouts, and diagram images stay outside the shipped app and are ignored by git under `sources/`. Runtime records retain source locators instead of source documents.

| Chapter | Slide deck | Assignment PDF | Reviewed scope |
| --- | --- | --- | --- |
| 7 | ch07 (1).pptx | CIS 4100 Assignment 7 Eric Juarez 2026.pdf | 39-slide deck, teaching slides 3–38; all five assignment pages, 7.1–7.21 |
| 8 | ch08 (1).pptx | Ch 8 Assignment_ CIS 4100-03 (95099).pdf | 29-slide deck, teaching slides 3–28; all ten assignment pages, Q1–35 |
| 9 | ch09 (1).pptx | Assignment Ch9_ CIS 4100-03 (95099).pdf | 36-slide deck, teaching slides 3–35; all ten assignment pages, Q1–36 |
| 10 | ch10 (2).pptx | Assignment 10_ CIS 4100-03 (95099).pdf | 49-slide deck, teaching slides 3–48; all ten assignment pages, Q1–36 |
| 11 | ch11 (1).pptx | Assignment 11_ CIS 4100-03 (95099).pdf | 24-slide deck, teaching slides 3–23; all eight assignment pages, Q1–35 |

OOXML text was extracted from every slide in order. PDF text was extracted page by page. Actual rendered assignment pages were inspected for Chapter 8 p.2, Chapter 9 p.3, Chapter 10 p.6 (including formulas lost in extraction), and Chapter 11 p.1. The embedded diagrams inspected directly include Chapter 7 slide 13 and Chapter 11 slides 12–14 and 23. PowerPoint COM rendering was attempted but failed with a Windows logon-session error; embedded images were used for diagram verification instead.

A locator such as “Slide 18” in a Chapter 8 question means slide 18 of `ch08 (1).pptx`. An assignment Q locator identifies the numbered Canvas question; 7.x identifies the written assignment exercise. “Derived” means an original numeric scenario worked independently from the identified model. Historical interface examples are explicitly qualified instead of presented as current product specifications.

[Coverage](COVERAGE.md) maps major concepts, assignment exercise families, question IDs, and each record’s locator. [Source issues](SOURCE_ISSUES.md) lists exclusions, source conflicts, and remaining uncertainty.

## Reference projects inspected

- CIS 4100 Study Studio: https://github.com/Atomic-Rose/cis4100-practice — README, app-shell.html (session/storage/keyboard/history flows), and question-bank.json sample. All 442 question records were imported with original IDs via the provided importer. No progress was inferred from content.
- SmartPrep v2: https://github.com/Atomic-Rose/smartprepv2 — styles/tokens.css, styles/quiz.css, src/views/library.js, src/views/quiz.js, src/views/results.js, and src/logic/session.js. Reused the neutral/cobalt visual direction, stable divided rows, modular source structure, deferred reveal, and targeted results action.

The starter’s first eight records per chapter retain their IDs, types, canonical answers, and correct choice texts. The second-pass editorial audit revises explanations, distractors, and three prompts without changing scoring semantics. Expansion adds C7-009–032, C8-009–032, C9-009–032, C10-009–038, and C11-009–037. Every new question is original prose. Official Canvas keys are not represented as a complete verified bank.
