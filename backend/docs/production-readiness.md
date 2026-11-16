# Cleanup and production readiness

This report records the earlier cleanup before the two-folder reorganization.
For current file locations and commands, see [project overview](project-overview.md).
Tests were subsequently removed from the working project by the owner; archived
tests can still be run in a temporary verification copy.

Reviewed on 10 November 2026. Work is local only: no deployment, remote Git push,
live database migration, administrator change, or live service call was performed.

## Recovery and preservation

- The original application is committed in Git at `4ede4b3`, tagged
  `cleanup-baseline`. The safe environment example is committed at `91c7097`.
- A separate source/configuration archive and consistent SQLite backup were
  created outside the repository at
  `/Users/kaunghtetzaw/linkfolio-backup-20261110-112358`.
- Local databases, WAL/SHM files, existing backups, OCR runtime/model assets,
  licenses, required configuration, routes, and saved document formats remain.
- Environment files, local databases, dependencies, generated builds and test
  artifacts are excluded from Git. `.env.example` remains tracked.

## MVC organization

The backend retains its existing MVC structure:

| Responsibility | Location |
| --- | --- |
| HTTP routing | `backend/routes/` |
| Request validation and orchestration | `backend/controllers/` |
| Persistence and domain queries | `backend/models/` |
| Authentication, limits, security headers and errors | `backend/middleware/` |
| Payment fulfillment and resume parsing | `backend/services/` |
| React views and reusable UI | `frontend/src/pages/`, `frontend/src/components/` |
| Client data/state helpers | `frontend/src/lib/` |
| Cross-runtime parsing schema | `shared/` |
| Serving the compiled view layer | `backend/web.js` |

Pure editor validators are still shared by importing existing client library
modules from the backend. Deployment must include `frontend/src` and `shared`,
alongside the server and compiled client. Moving these validators wholesale was
avoided to preserve existing module relationships and limit refactoring risk.

## Confirmed cleanup

Removed 17 source files outside the application/backend/test import graph:

- `frontend/src/App.css`
- From `frontend/src/components/`: `AddContentDialog.jsx`,
  `ColorPalettePicker.jsx`, `EditorSection.jsx`, `Features.jsx`,
  `ProductMockups.jsx`, `ProfileForms.jsx`, `ProfileProgress.jsx`, `TargetUsers.jsx`.
- From `frontend/src/components/editor/`: `AppearanceControls.jsx`,
  `CustomizationTabs.jsx`, `DesignWorkbench.jsx`, `EditorSection.jsx`,
  `ResumePreview.jsx`, `SectionPicker.jsx`, `SectionStyleControls.jsx`,
  `sampleResume.js`.

Also removed three unreferenced assets (`hero.png`, `react.svg`, `vite.svg`),
Finder metadata, root test-run metadata, the unused `cors` dependency, dead
helpers/constants, and unused bindings. Internally used helpers became private
instead of being removed. `@tiptap/pm` remains because it is a peer dependency.
The obsolete browser-test cleanup script was replaced by isolated test fixtures.

No source files were exact duplicates. Dynamic styles, migration compatibility
code, documentation, and assets were retained where non-use could not be proven.
Operational logs remain; unexpected API errors now log only error name/code.

## Refactoring and production safeguards

- Editor entry requests derive selection directly from props; effects handle
  scrolling with cancellation. Style setters have stable references for source
  synchronization. Existing layout behavior and CSS remain.
- Section-design choices use named options and a readable layout condition.
- Root linting now covers frontend, backend, shared code and scripts, rejecting
  warnings as well as errors.
- Targeted lockfile updates address reported dependency vulnerabilities. A
  `minimatch` override to `^11.0.5` patches the ESLint dependency chain without
  downgrading ESLint or changing application features. Recheck this override
  when upstream ESLint dependencies adopt a patched range.
- Node support is bounded to the supported 22 and 24 release lines. The existing
  Render Node 24 pin remains; local verification used Node 22.22.2.
- Frontend installation explicitly includes build dependencies even when the
  hosting environment sets `NODE_ENV=production`; Vite is needed to compile the
  React view layer before starting the server.
- Security headers cover HTML, static assets, API responses and webhooks. The
  production CSP permits local scripts, WebAssembly, blob workers, data images,
  inline design styles, and same-origin device-preview frames.
- Production rejects a missing client build before opening the configured
  database. Startup also validates the port and existing HTTPS origin rules.
- AI parsing is limited to ten requests per account per fifteen minutes.
  Exhausted limits include `Retry-After`; existing authentication and IP-based
  limits remain.
- Browser tests use a separate native Node subprocess, in-memory database and
  available port per test. They pass an empty service configuration and never
  load dotenv or a configured database. This fixes shared registration quotas
  breaking the previous full test suite without weakening application limits.

## Verification

Before cleanup, backend tests reported 58 passes and 5 PostgreSQL skips. Lint
reported 10 errors and 2 warnings. The initial browser run was interrupted after
confirming stale selectors and cascading HTTP 429 failures from shared rate-limit
state; 9 tests had passed and 21 had not run.

| Check | Result |
| --- | --- |
| `npm run lint` | Pass, no errors or warnings across frontend/backend/shared/scripts |
| `npm test` | 62 passed; 5 PostgreSQL tests skipped |
| Clean `NODE_ENV=production` installation and build | Pass in a disposable project copy |
| Server and client dependency audits | Zero known vulnerabilities in both lockfiles |
| Real production entry point | Startup, health, SPA routes, headers, SIGTERM shutdown and invalid-port rejection passed with a temporary SQLite database |
| Production-mode browser policies | Editing, PDF export, device preview, anonymous public sharing and OCR passed with no CSP violations |
| Complete browser suite | 57 passed in 3.2 minutes; no failures |
| Local saved database | Logical contents match the pre-cleanup backup |

Browser assertions that referenced retired tabs, font buttons, advanced panels,
and resume-card selectors were updated to exercise the current controls. Their
style, content, privacy, persistence and export assertions remain. Representative
desktop resume-editor and mobile portfolio-editor screenshots were inspected.
The production browser check runs on localhost and does not replace validation
of a hosted HTTPS environment.

Cleanup, refactoring and production safeguards are committed as separate local
Git checkpoints. The completed state is tagged `cleanup-verified`; use `git log`
to inspect each change. No remote is configured and nothing was pushed.

## Checks required before a future deployment

- Run the PostgreSQL tests against an isolated `TEST_DATABASE_URL` with permission
  to create disposable databases. Do not point tests at the application database.
- Verify the intended hosting environment, HTTPS origin, reverse-proxy behavior,
  production cookies, database connectivity, backup/restore procedures and Node
  24 runtime. Existing Render/Supabase configuration was not deployed or changed.
- Supply SMTP and a valid sender address to enable password-reset delivery.
  Without SMTP, production password reset returns 503; ordinary login still works.
- If payments are enabled, configure the Stripe key, price and webhook secret;
  verify hosted checkout and webhook delivery in Stripe test mode first.
- If AI parsing is enabled, verify the configured provider/model with explicit
  consent and a non-sensitive sample. Automated tests use fake transport only.
- Process-memory rate limits reset on restart and do not coordinate across
  instances. Use shared limits before running multiple instances.
- CSP intentionally allows inline styles for saved designs and PDF rendering.
  Do not remove required worker/WebAssembly permissions without testing OCR.
- The build still warns about a main JavaScript chunk larger than 500 kB. OCR
  assets are approximately 17 MB and required. Further splitting is a performance
  follow-up, not a condition for functional verification.
- Automated UI checks and screenshots cover tested desktop/mobile cases; they
  cannot prove pixel equivalence for every possible user document.
- No confirmed embedded credentials were found in the source scan. Private
  database contents and external service secret stores were not security-audited.
