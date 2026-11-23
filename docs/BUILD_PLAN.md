# Second-pass build status

Implemented the finals-only nightly study loop in the existing modular app. Start offers resume when available. Study offers one primary decision (resume, missed, mixed), a secondary mock action, and five compact chapter rows with actual practiced/missed status. A chapter view provides one-click topic practice and a single session-options disclosure.

The quiz uses a consistent content width and slim progress/save/flag rail. Practice separates selection from checking; mocks defer feedback, retain editable answers, and support next unanswered/flagged navigation. Submission states the unanswered total. Results give evidence for one recommended topic, fresh-topic practice or a missed fallback, retries, and a useful perfect-score action.

The bank stays at 171 finals records. The editorial audit revises 100 explanations, 53 option sets, and three prompts, retaining all question IDs, types, canonical answers, correct option texts, and source locators. Source conflicts remain documented rather than filled with inferred Canvas keys.

All study surfaces are finals-only. Archive content and progress remain stored, incompatible active attempts are parked intact, and valid finals sessions resume unchanged. Finals reset preserves archival records. Backup import/export remains available; saved-mock/cram logic and legacy import utilities remain in source but are not promoted in the study UI.

36 automated checks pass, including the requested controller journeys. Three supplied screenshots were inspected. Live desktop/mobile browser verification remains blocked by browser-access restrictions; see VALIDATION.md for the exact limits. No deployment or commit was performed.
