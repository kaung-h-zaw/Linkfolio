# Linkfolio backend

Express API organized with MVC: `routes/` map requests to `controllers/`,
`models/` handle persistence, and the React client provides the views.
Middleware handles authentication, request validation, security headers and errors.

## Run locally

Use Node 22.13+ within Node 22, or Node 24. In a terminal inside `backend/`:

```sh
npm ci
npm run dev
```

The API runs at `http://localhost:3001`. Start the frontend separately from
`frontend/` with `npm ci --include=dev` followed by `npm run dev`.
No root `package.json` or combined startup script is required.

## Configuration and saved data

Use `.env.example` as the configuration reference. Local development uses
`data/linkfolio.sqlite` unless `DATABASE_URL` is configured. Keep `data/`, backups
and actual `.env` files private; both folders have their own `.gitignore`.

The backend still imports pure document validators from `../frontend/src/lib/`.
Resume parsing and its schema now live in
`../frontend/src/lib/resumeParsing/`. Keep both source folders in the repository;
this layout change does not introduce duplicate parsing or validation logic.

## Commands

- `npm start`: run the server without the development file watcher.
- `npm run lint`: check backend code using the lint tools installed in `frontend/`.
- `npm run db:check`: check the configured database.
- `npm run db:normalize`: back up and normalize existing local document data.
- `npm run db:import`: import local data into an empty configured PostgreSQL database.
- `npm run admin`: create an administrator using explicitly configured credentials.

Tests were removed from the working project at the owner's request. The earlier
verified test suite remains available in Git at the `cleanup-verified` tag.

## Production

The existing deployment serves the built React client and API together. From
inside `frontend/`, install with `npm ci --include=dev`, then run `npm run build`.
From inside `backend/`, install with `npm ci`, set the production environment,
and run `npm start`. Production requires an HTTPS `APP_ORIGIN` and either
`DATABASE_URL` or an explicit `DATABASE_PATH` on persistent storage.
SMTP, Stripe and AI credentials remain optional and server-only.

The server still expects `../frontend/dist` for this production arrangement.
Hosting a frontend and API on separate origins requires a separate API/CORS/cookie
configuration change; no deployment was performed during this reorganization.

See [project overview](docs/project-overview.md),
[database mapping](docs/relational-database.md),
[resume import](docs/resume-import.md), and the
[backend learning guide](docs/backend-learning-guide.md).
