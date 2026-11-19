# Chapter 6 test evidence

Run date: 2026-11-19. These results are from the current working tree and use synthetic test accounts.

## Executed results

- Backend command: `cd backend && npm test`
- Backend outcome: 38 feature subtests passed, 0 failed, 1 skipped. The PostgreSQL integration case was skipped because `LINKFOLIO_TEST_DATABASE_URL` was not configured. API fixtures use isolated in-memory SQLite databases; the persistence check uses a disposable file-backed SQLite database and verifies it after reopen. Test servers bind to ephemeral localhost ports.
- Browser command: `cd frontend && npm run test:e2e`
- Browser outcome: 2 Playwright tests passed. Playwright starts an API server with in-memory SQLite and Vite on dedicated local ports 38371 and 5174. Billing is configured for demo mode; no SMTP, Stripe, OpenAI, or production database credentials are loaded.
- PDF artifact: `resume-export.pdf` is a browser-generated one-page PDF from a newly created resume. The PDF flow verified the download event, `.pdf` filename, and non-empty artifact. The resume was otherwise blank, so this is evidence of export/download behavior rather than a content layout review.

## Files

- `backend.tap.log`: full Node TAP output for the backend suite.
- `playwright.log`: full output from the latest successful browser run.
- `authenticated-empty-workspace.png`: screenshot after synthetic account registration.
- `resume-editor-before-export.png`: screenshot of the resume editor before PDF export.
- `resume-export.pdf`: generated PDF artifact.

## Scope and limits

No production database or user data was accessed. No real payment, email, or AI request was made. PostgreSQL behavior, live Stripe webhook signatures, SMTP delivery, and AI provider parsing remain unverified. PDF content fidelity still needs a manual review using a resume populated with representative multi-page content.

The logs and artifacts are reproducible with the commands above. The tests create transient accounts and documents; they do not persist a shared test database.
