# Codex brief for SmartPrep · CIS 4100 Finals

Build and finish a focused study app for my CIS 4100 computer organization final. I should be able to open it, click **Start studying**, pick a chapter or a study mode, and get to a real question immediately. Use the uploaded Chapters 7–11 slides and assignments for the finals bank. Treat Chapters 1–6 as an optional midterm archive. The chapters in this bank are my study scope. Leave exam coverage, timing, and format unspecified.

## Read these first

1. [CIS 4100 Study Studio](https://github.com/Atomic-Rose/cis4100-practice) is the midterm reference. Read the README, `app-shell.html`, and a sample from `question-bank.json`. Reuse the functional ideas: chapter/topic selection, balanced sessions, deferred mock feedback, resume, flags, latest missed review, history, keyboard shortcuts, and offline access. Preserve old question IDs when importing that bank.
2. [SmartPrep v2](https://github.com/Atomic-Rose/smartprepv2) is the visual and code-organization reference. Read `styles/tokens.css`, `styles/quiz.css`, `src/views/library.js`, `src/views/quiz.js`, `src/views/results.js`, and `src/logic/session.js`. Carry forward the warm neutral canvas, cobalt primary action, generous type and spacing, flat divided answer rows, and one targeted next step. Use the CIS 4100 course and chapter titles in this build.
3. If this starter is present, run it and read `docs/BUILD_PLAN.md` and `docs/SOURCE_MAP.md`. Use and improve the existing modules and question data. If the repo is blank, implement the same structure from the requirements below. The course files are supplied separately in the workspace.

## Build the four-screen flow first

- **Start.** Use a small brand mark, course name and scope, and one clear **Start studying** button. The landing screen should feel like opening a study tool.
- **Choose.** Show a compact chapter list and quick actions for **Mixed practice** and **Mock test**. Show **Resume session** and **Review missed** when available. Selecting a chapter starts a session. Put question count and other optional setup behind one expandable control.
- **Study.** Show one prompt, its answer rows, and a slim progress rail. Support True/False and four-choice single-answer questions. Let me choose and then check in practice. Keep one **Continue** button after a check. Under the answer rows, explain the idea and cite the slide or assignment location. Mock answers stay editable and explanations appear after submission. Skip and save/exit should have predictable behavior.
- **Results.** Show the score and unanswered count, then one suggested topic and a way to retry the missed items. Prefer unseen questions in the suggested topic, and fall back to missed ones. Make the full answer review expandable. Keep the quick study flow free from dashboard charts, promotional text, accounts, and API-key setup.

Design for mobile and desktop. Use the cobalt for primary actions and green/red only for feedback. Use meaningful typography and whitespace to create hierarchy. Keep focus visible, use native accessible controls, label feedback in words, and honor reduced motion. Keep the quiz stable when a selection changes. Support Tab/Enter, T/F, and A–D or 1–4.

## Build the question bank from the course materials

Review all five slide decks and five assignment PDFs. Cover each major concept and exercise type with original prompts, including scenario comparisons, instruction traces, and short worked calculations. Begin with the 40 verified starter records if available. Use a coverage map to expand each chapter and flag unresolved content. Keep four plausible, mutually exclusive options and one best answer for MCQs. Keep the true/false distribution reasonably balanced.

Each record needs a stable ID such as `C9-023`, chapter, topic, type, prompt, choices, canonical answer index, teaching explanation, and source locator. Index 0 is a valid answer. Preserve True then False order. Shuffle multiple-choice display order while persisting its mapping and the session’s question order. Keep the raw course files out of git and out of the runtime. Use slide or assignment references for provenance.

Assignment exports show submitted answers and may include ungraded work or hidden keys. Check the relevant slide or actual annotated page before calling an answer verified. Derive numeric answers independently, include units and assumptions, and document ambiguities. Avoid copying large blocks of course material. For Chapter 11, use the attached slides to verify the concepts because the supplied Canvas snapshot withholds the official answer key.

## Iterate after the core path works

1. Complete the finals question bank and chapter/topic filtering. Keep mixed sessions balanced as far as the available pool permits and avoid duplicates. Keep the quick default at 10 questions and a fresh mock at 20, with advanced lengths behind options.
2. Add saved mocks, navigator, flags, cram mode, optional timer, and progress/history. Use deterministic seeds for repeatable mocks and measure overlap. A timer needs an absolute deadline that survives refresh. Separate first attempts, retries, and unanswered outcomes. Provide explicit backup/import and reset. Import legacy content separately from legacy progress.
3. Keep the source modular with static HTML, CSS tokens, JS views, pure session logic, and data. Start with the existing Node 22+ local server. Add a generated single-file offline build when practical. The app should require no external dependencies at runtime.
4. Verify the browser flow at mobile and desktop sizes. Test both question types, answer checking, scoring, deferred reveal, skip/revisit, resume, retries, no-pool states, and corrupt or blocked storage. Include automated checks for bank integrity and session logic. Report commands run, browser checks, feature gaps, and any outstanding source issues.

Give me a short plan based on what is already in the repo, then implement the flow and run the checks in the same task. Prioritize a usable study session and clear source-backed explanations before secondary features.
