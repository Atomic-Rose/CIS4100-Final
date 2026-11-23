# Build status

The starter was expanded in place. The local-only app now has the Start → Choose → Study → Results flow, 171 finals records, and an optional 442-record midterm archive. The original 40 finals IDs and all imported archive IDs are preserved.

Implemented: chapter/topic selection, balanced sampling without duplicates, practice checks, deferred/editable mocks, skip/revisit navigator, save/resume, saved mocks with measured overlap, global flags, cram, optional absolute deadlines, immutable first-attempt accounting, latest missed review, retries, targeted unseen follow-up, history, validated backups/import/reset, separate legacy progress import, keyboard controls, reduced-motion CSS, responsive layouts, and a generated self-contained offline HTML build.

Verified by automated bank/session tests and execution of the real offline controller in a minimal DOM adapter. These tests do not certify layout or native browser behavior. See VALIDATION.md for the blocked desktop/mobile checks and manual checklist.

Remaining limits: supported-source gaps in SOURCE_ISSUES.md; legacy progress import requires completed history and does not restore legacy settings or an active legacy session; no real browser QA completed due to connection/approval restrictions. No hosting/deployment was requested or performed.
