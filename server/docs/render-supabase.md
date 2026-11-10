# Test and deploy with Render Free + Supabase Free

The React frontend and Express API run together on **one Render web service**.
Supabase stores the PostgreSQL database. The browser calls `/api` on the same
Render address, so authentication does not need cross-site cookies or CORS.

Local development still uses SQLite when `DATABASE_URL` is absent. When it is
set, the backend uses PostgreSQL for accounts, sessions, resumes, portfolios,
messages, analytics, plans, and templates. Existing Express authentication is
retained; you do not need Supabase Auth or a Supabase API key.

## 1. Create your free Supabase project

1. Create a **Free** project in Supabase. Singapore is a useful region to pair
   with your Render service.
2. Open **Connect → Session pooler** and copy the PostgreSQL URI using port **5432**.
   Use the exact host and username shown by your dashboard.
3. Replace `[YOUR-PASSWORD]` with your database password. URL-encode reserved
   password characters such as `@`, `#`, `%`, `/`, and `?`.

Use the **database connection string**, not the project URL, anon key, or service
role API key. Session pooling supports IPv4, which avoids needing Supabase's paid
IPv4 add-on. See [Supabase connection instructions](https://supabase.com/docs/guides/database/connecting-to-postgres).

## 2. Test Supabase locally first

Copy `server/.env.example` to `server/.env` if you do not already have an env file.
Add your connection settings to that file:

```dotenv
APP_ORIGIN=http://localhost:5173
DATABASE_URL=YOUR_SESSION_POOLER_CONNECTION_STRING
DATABASE_SSL=true
```

Leave `NODE_ENV=production` unset for this local test. Credentials stay in the
server env file; never add them to a `VITE_` variable or commit them to Git.

From the project root:

```sh
npm --prefix server ci
npm --prefix client ci --include=dev
npm --prefix server run db:check
npm --prefix server run dev
# In a separate terminal:
npm --prefix client run dev
```

`db:check` connects, creates the app's tables if needed, and seeds the template
catalog without replacing saved data. It should print `Database ready (postgres)`.
The tables appear under the **linkfolio** schema in Supabase, rather than the
default public schema. Do not add that schema to Supabase's exposed Data API schemas.

If your connection reports a certificate error, download your project's CA
certificate from Supabase's database SSL settings and set `DATABASE_SSL_CA` to
its PEM content (actual newlines or `\n` escapes). Certificate verification stays
enabled; do not disable TLS to work around the error.

Open `http://localhost:5173` and check:

- Register or log in, save a resume, then refresh the page.
- Create a portfolio from a resume and check that it receives an address.
- Publish it and open its public URL in another browser.
- Send a contact message and check the owner's Messages and Analytics pages.
- Stop and restart the server; check that saved work and login sessions remain.

Switching databases does not automatically copy your existing local accounts.
Create a test account, or use the optional import below before registering.

## 3. Optional: copy your existing SQLite data

Stop local development first. Keep `DATABASE_URL` pointing to your **empty**
Supabase application database and run:

```sh
npm --prefix server run db:import
```

The default source is `server/data/linkfolio.sqlite`. Set `SQLITE_IMPORT_PATH` in
`server/.env` if the file is elsewhere. The importer reads the source without
modifying it and copies accounts, documents, publication addresses, uploaded
image data, messages, analytics, payments, and catalog settings in one transaction.
Accounts keep their existing password hashes. Sessions and reset links are not
copied, so sign in again afterward.

The importer refuses to run if the destination already contains accounts. A
failed import rolls back the imported rows. It never deletes destination data.
Do not run this command during normal startup or on every Render deploy.

## 4. Deploy the app to Render Free

Push the project to a GitHub repository, excluding `server/.env` and
`server/data/`. In Render, create a **Web Service** from that repository:

| Setting | Value |
| --- | --- |
| Root directory | Leave empty (repository root) |
| Runtime | Node |
| Region | Singapore |
| Instance type | **Free** |
| Build command | `npm --prefix server ci && npm --prefix client ci --include=dev && npm --prefix client run build` |
| Start command | `npm --prefix server start` |
| Health check path | `/api/health` |

Set these environment variables in Render:

| Variable | Value |
| --- | --- |
| `NODE_VERSION` | `24.21.0` |
| `NODE_ENV` | `production` |
| `APP_ORIGIN` | Your exact HTTPS Render origin, e.g. `https://linkfolio-xxxx.onrender.com`, without a trailing slash |
| `DATABASE_URL` | Your Supabase Session pooler URI |
| `DATABASE_SSL` | `true` |
| `DEMO_PAYMENTS` | `false` |
| `DATABASE_SSL_CA` | Only if your database requires the downloaded CA certificate |

Render displays the assigned service address when creating your service. Use
that address for `APP_ORIGIN`; if it changes, update the variable and redeploy.
The backend refuses to fall back to a temporary SQLite file in production when
database settings are missing.

The optional Render blueprint was removed from this checkout. Use the manual
service settings above; no deployment is performed by these source changes.

After deployment, open `https://YOUR-SERVICE.onrender.com/api/health`; expect
`{"status":"ok"}`. Then repeat the local checks on the deployed website.

Production does not enable the local simulated payment flow. To try Premium
templates without payment, use your own administrator account: configure
`ADMIN_EMAIL` and `ADMIN_PASSWORD` locally with the same `DATABASE_URL`, run
`npm --prefix server run admin`, and remove `ADMIN_PASSWORD` afterward. The new administrator
account has Premium. Password-reset emails require separate SMTP configuration;
without it, registration and normal login still work.

## Free-plan behavior during your demonstration

Render Free sleeps after 15 minutes without traffic and can take about a minute
to wake up. Open the site before presenting. The database lives in Supabase and
survives Render restarts. Supabase Free projects can pause after a week of
inactivity; check that the project is active before your demonstration.

These limits come from [Render Free](https://render.com/docs/free) and
[Supabase Free](https://supabase.com/pricing). This setup does not remove them.
