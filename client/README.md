# Linkfolio client

React, Vite, React Router and Tailwind. Run the full application from the repository root with `npm run dev`; the client needs the Express API on port 3001. See the [project README](../README.md) for accounts, database persistence, publishing, payments, administration and deployment.

## Checks

```sh
npm run lint
npm run build
npx playwright install chromium
npm run test:e2e
```

The root `npm test` runs backend integration tests. Each browser test runs its own local server on an available port with an isolated in-memory database. Tests load no live service credentials and save screenshots, failure traces and downloaded PDFs under `test-results`.

## Main code paths

- `src/pages/EditorPage.jsx` edits shared professional data for resumes and portfolios. Resume PDF download is available from its toolbar.
- `src/lib/resumeStorage.js` maintains the current account's in-memory workspace and persists writes through the API. `readLegacyResumes` reads old browser drafts for explicit import.
- `src/components/AuthProvider.jsx` restores sessions and guards private routes; authentication uses server-issued HttpOnly cookies.
- `src/pages/SetupPage.jsx` lists saved work, generates linked portfolios and supports deletion.
- `src/pages/WorkspacePage.jsx` provides dashboard, analytics, messages, account, plans and admin views.
- `src/pages/PublicPortfolioPage.jsx` loads public portfolios at `/p/:slug`; public visibility is enforced by the server.
- `src/components/PortfolioPreview.jsx` and `src/components/ResumePreview.jsx` share the existing content renderers with editor and template previews.
- `src/components/editor/PublicationPanel.jsx` manages custom URLs and visibility; `src/components/ContactForm.jsx` handles visitor messages.
- The pure section schema and design validators in `src/lib` are also used by server validation.

Template demonstrations use sample content. New drafts start with the account name and email and empty professional sections. Resume import supports PDF, DOCX, text and local image OCR; AI parsing is optional. See [resume import](../docs/resume-import.md). Privacy/Terms pages remain outside the reports' implementation scope.
