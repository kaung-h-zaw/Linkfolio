# Linkfolio

Resume and portfolio builder aligned with the ISP initial proposal and interim report. React/Vite provides the editor and templates; Express provides account storage and public portfolio access using SQLite locally or Supabase PostgreSQL when `DATABASE_URL` is set.

The database now includes relational resumes, portfolios, profiles, themes and
professional sections based on the interim design. See the
[database mapping and migration guide](docs/relational-database.md).
`npm run db:normalize` backs up a configured local SQLite database before
backfilling existing documents. Restart the backend after updating the code.

The backend follows the teacher's MERN Recipe App authentication structure: CommonJS modules, user routes, UserController, User.register/User.login, models and middleware. Start with the [backend learning guide](server/README.md) to follow registration and login step by step.

## Run locally

Use Node **22.13 or newer** (Node 24 LTS is also supported). SQLite uses Node's built-in `node:sqlite`; Node 22 may print an experimental warning.

```sh
npm run install:all
npm run dev
```

Open **http://localhost:5173** and register your account. The API runs on port 3001. Vite proxies `/api` to the server. Both processes stop with Ctrl+C. Data persists in `server/data/linkfolio.sqlite` and is excluded from source control.

1. Choose a free resume template, enter your details, and save.
2. In My resumes, choose **Generate portfolio**. This uses the same saved document, so resume and portfolio share their content.
3. Customize the portfolio, choose a custom URL under **Publish & share**, and select Public.
4. Open `/p/your-name` in another browser to view the published page and send a message.
5. Check **Messages** and **Analytics** in your workspace.

Both editors organize **Design** into **General** and **Sections**. General controls the template, palette, fonts, spacing and document-wide settings. In Sections, choose a section from the dropdown or click it in the live preview to adjust its heading, visibility, layout and appearance. Sections inherit General until customized; **Reset to general style** clears local appearance overrides while keeping the heading and visibility. Resume ordering and page breaks are under **Sections → Arrange sections**. Portfolio personal photos and cover styling are under **Sections → Introduction → Image styling**; project cards and images are under **Sections → Projects**. Save keeps these choices in your account, and portfolio section styles also appear on the published page.

Existing drafts from the earlier frontend preview can be imported through **Dashboard → Import browser drafts**. Imports use the current account and obey its limits. Browser copies are preserved. Use the same browser and origin where the old drafts were saved.

To import a resume from another app, choose **My resumes → Import existing resume** (also available on Dashboard). Upload a PDF, Word `.docx`, or `.txt` file up to 5 MB, or paste text. Review the extracted text, contact details, and template, then choose **Import and open editor**. The importer recognizes common section headings and keeps each section's text editable; split experience/education entries and fill dates in the editor as needed. Unrecognized text stays in an Imported details section. Files are read locally; reviewed fields are saved through the existing authenticated document API and obey account limits. Original layout/images are not imported, and scanned PDFs require OCR text. Import accepts up to 30 PDF pages and 60,000 characters of text.

New drafts start with your account name/email and empty professional sections. Sample content is used only in template demonstrations. Saved work belongs to its authenticated account.

## Plans and administration

Free accounts allow one resume and one portfolio. A resume with a generated portfolio counts toward both limits. Premium defaults to 20 of each and enables premium templates. Limits and template availability can be managed by an administrator.

To create an administrator, copy `server/.env.example` to `server/.env`, set your own `ADMIN_EMAIL` and `ADMIN_PASSWORD`, then run:

```sh
npm run admin
```

Log in using those credentials and open `/admin`. This command creates or promotes the specified account and updates its password; existing sessions for that account are revoked. There is no default administrator password. Remove `ADMIN_PASSWORD` from `.env` after provisioning.

## Payments and password resets

Without Stripe configuration, **local development** offers a labelled demo checkout with successful and failed payment outcomes. It collects no money or card information. Demo payments are always disabled when `NODE_ENV=production`.

For real checkout, configure `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, and `STRIPE_WEBHOOK_SECRET` in `server/.env`. Use a one-time Stripe price for Premium. The server creates a [Stripe Checkout Session](https://docs.stripe.com/api/checkout/sessions/create) and activates Premium only after verifying a paid session on the server or receiving a signed webhook. Forward `checkout.session.completed` and `checkout.session.async_payment_succeeded` to `/api/billing/webhook`. Use Stripe test mode before accepting payments. Pricing is displayed by the configured Checkout price; no price is hardcoded in the app.

For password reset email delivery, configure `SMTP_URL` and `MAIL_FROM` using [Nodemailer SMTP](https://nodemailer.com/smtp). Without SMTP, development displays a clearly labelled local reset link. Production never returns reset tokens to the browser and requires SMTP. Reset tokens expire after 30 minutes, are single-use, and revoke existing login sessions.

## Production build

For the university project, use the [Render Free + Supabase Free guide](docs/render-supabase.md).
It includes a local Supabase connection test, optional SQLite data import, and
the deployment settings in [render.yaml](render.yaml).

```sh
npm run build
npm start
```

The server serves the built client and its routes from port 3001 (or the host's `PORT`). For deployment, set `NODE_ENV=production` and `APP_ORIGIN` to the HTTPS origin of your application. Cookies are HttpOnly, SameSite=Lax, and Secure in production. Set `DATABASE_URL` for Supabase; a production startup without it requires an explicit `DATABASE_PATH` on persistent storage. Render Free has no persistent disk, so use Supabase there. Configure Stripe and SMTP independently; neither service credential is included.

## Validation

```sh
npm test
npm run lint
npm run build
# Browser workflow test, with an isolated database on port 4173:
npx --prefix client playwright install chromium
npm run test:e2e
```

Backend integration tests exercise accounts, ownership boundaries, free limits, public/private controls, URL collisions, message validation, analytics, reset tokens, admin access, demo payment outcomes, deletion and persistence. No external payment or email service is needed for these tests.

Relational migration tests also check exact recovery of older drafts, section
ordering, normalized reads, transaction rollback and cascading deletion. Set
`TEST_DATABASE_URL` only to an isolated PostgreSQL test server with permission to
create temporary databases to run the PostgreSQL variants.

See [requirements.md](docs/requirements.md) for the mapping to the reports and implementation choices.

Portfolio editing uses three views in one toolbar: **Content**, **Design**, and **Sharing**. The Sharing view (`/portfolio/editor/share`) contains portfolio URL, visibility, publishing and copy-link controls.
