# Learn the Linkfolio backend

The backend follows the authentication organization in your teacher's [MERN Stack Recipe App, Episode 138](https://github.com/HlaingMinThan/MERN-stack-Recipe-App/tree/Episode-138): CommonJS modules, Express routers, `UserController`, `User.register`, `User.login`, authentication middleware and a separate sign-in helper.

The repository's default branch is Episode 89, which is an early lesson. The authentication implementation is in later branches; this guide compares against Episode 138.

## Compare with your teacher's files

| Recipe app | Linkfolio | Purpose |
| --- | --- | --- |
| `backend/server.js` | `index.js` and `app.js` | Start Express and connect routes and database |
| `backend/routes/users.js` | `routes/users.js` | Map account URLs to controller functions |
| `backend/controllers/UserController.js` | `controllers/UserController.js` | Read form input, call the model, return a response |
| `backend/models/User.js` | `models/User.js` | `User.register()` creates accounts; `User.login()` verifies passwords |
| `backend/middlewares/AuthMiddleware.js` | `middleware/AuthMiddleware.js` | Identify the signed-in account and assign `req.user` |
| `backend/helpers/createToken.js` | `helpers/createSession.js` | Create the sign-in credential and send its cookie |
| `frontend/src/contexts/AuthContext.jsx` | `../client/src/components/AuthProvider.jsx` | Keep the current user in React context and restore login with `/me` |

Linkfolio keeps its existing database and API responses, so your saved accounts and frontend keep working. These details differ from the recipe app:

- **Database:** the recipe app uses MongoDB/Mongoose; Linkfolio uses SQLite locally and PostgreSQL when `DATABASE_URL` is set. `await User.findByEmail(email)` plays the role of `await User.findOne({ email })`. Both database modes use the same models and controllers.
- **Passwords:** the recipe app uses bcrypt; Linkfolio uses salted scrypt hashes in `users.password_hash`. Existing passwords continue to work.
- **Sign-in cookie:** the recipe app signs a JWT; Linkfolio creates a random token and saves a hash of it in the `sessions` table. Both use an HttpOnly cookie. Linkfolio removes the saved session on logout and password reset.
- **API:** the recipe app mounts `/api/users`; Linkfolio keeps `/api/auth`. Login and registration return `{ user }` containing public account fields. Password hashes and session tokens stay out of that JSON response.
- **React:** the recipe app uses Axios and a reducer; Linkfolio uses a fetch helper and state in its existing context provider. Both ask the backend `/me` endpoint to restore the signed-in user.

## Start here

Read these files in this order:

1. [index.js](../index.js) — loads `.env`, creates the app and starts the server.
2. [app.js](../app.js) — sets up the database, middleware and route groups.
3. [routes/users.js](../routes/users.js) — chooses which controller handles each authentication URL.
4. [controllers/UserController.js](../controllers/UserController.js) — registration, login, logout and password reset steps.
5. [models/User.js](../models/User.js) — registration, password verification and user queries in SQLite.
6. [middleware/AuthMiddleware.js](../middleware/AuthMiddleware.js) — identifies the signed-in user before a protected controller runs.
7. [helpers/createSession.js](../helpers/createSession.js) — signs in an account with a cookie.
8. [security.js](../security.js) — password hashing and cookie/token helpers.

## What each folder does

```text
server/
  index.js                 Starts listening on port 3001
  app.js                   Connects the pieces together
  routes/                  URL and HTTP method → controller
  controllers/             Read input, validate, call models, send JSON
  models/                  Account operations and database queries
  middleware/              Checks that run before/after controllers
  helpers/createSession.js Creates the sign-in cookie and saved session
  services/paymentService.js  Verified Premium payment fulfillment
  database.js              Creates SQLite tables and starts domain backfill
  relationalContent.js     Writes/reads relational editor content, preserving old drafts
  schema/relational-content.sql  Shared SQLite/PostgreSQL domain schema
  migrateRelational.js     Backup, migrate and verify local data
  validation.js            Checks account/editor input
  security.js              Hashes passwords and handles tokens
  data/linkfolio.sqlite    Saved database
```

Other Linkfolio features use the same router and controller organization. For example, `DocumentController.index` lists resumes, `store` saves one, and `destroy` deletes one.

## Follow a login request

1. The frontend sends an email and password to `POST /api/auth/login`.
2. `app.js` matches `/api/auth` and passes the request to `users.js`.
3. The router calls `UserController.login`.
4. The controller validates the input and calls `User.login(address, password)`, like the recipe app.
5. The model finds the account using `User.findByEmail(address)`.
6. The model calls `checkPassword` to compare the entered password with the saved hash and returns the account on success.
7. On success, `createSession` saves a session and sends an HttpOnly cookie.
8. The controller returns `{ user: ... }`; React opens the workspace.

Incorrect credentials return HTTP 401 with an error message. The response includes account details but never a password or password hash.

## Follow a protected request

This line in `users.js` has three parts:

```js
router.get('/me', requireAuth, UserController.me)
```

- `/me` is the route, mounted under `/api/auth`.
- `requireAuth` checks the session cookie and finds its account.
- `UserController.me` sends the account details back.

`requireAuth` assigns the account to `req.user` and calls `next()`. That means "the check passed; run the next handler." Without a valid session, it sends HTTP 401 and the controller does not run. Admin routes add `requireAdmin` after `requireAuth`.

## Objects and values you will see

| Code | Meaning |
| --- | --- |
| `req.body` | Values sent by a form, such as email and password |
| `req.params.id` | The ID in a URL such as `/api/documents/123` |
| `req.user` | The account found by authentication middleware |
| `res.json(...)` | Send a JSON response to the frontend |
| `req.app.locals.models` | Database models created by `app.js` |
| `req.app.locals.config` | Server settings such as the app URL and cookie options |

For example:

```js
const { User } = req.app.locals.models
const user = await User.findByEmail(address)
```

The first line obtains the app's User model. The second line asks it to find a user. You can read the SQL implementation in `models/User.js`. Each model is created with a database connection, so automated tests can use a separate database without changing your real data.

## Validation and errors

`email(value)` validates and normalizes an email. `password(value)` checks the password length. `requireValue(condition, message, status)` throws an error when a condition fails.

Express 5 forwards errors thrown in controllers, including async controllers, to `middleware/errorMiddleware.js`, as described in the [Express error-handling guide](https://expressjs.com/en/guide/error-handling/). That file sends a useful error status and message instead of exposing internal errors to the frontend. The course uses Express 4, where async handlers typically need explicit `try/catch` and `next(error)`.

## Where is my password?

Open `data/linkfolio.sqlite` in a SQLite viewer and inspect the `users` table. `password_hash` contains a salt and a hash, not your original password. `UserController.register` calls `User.register`, which hashes the password. `UserController.login` calls `User.login`, which checks the password hash. Passwords are not printed in server logs. To change a forgotten password, use the frontend's Forgot password link.

For local development without SMTP, the reset page displays a clearly labelled demo reset link. Production requires SMTP and does not return reset tokens to the browser.

## Run and check

Backend terminal:

```sh
cd /Users/kaunghtetzaw/linkfolio/server
npm run dev
```

Frontend terminal:

```sh
cd /Users/kaunghtetzaw/linkfolio/client
npm run dev
```

Open `http://localhost:5173`. The API runs at `http://localhost:3001`. Press Ctrl+C in both terminals to stop them.

Run `npm run lint` from each application folder. The previously verified test suite is available in Git at `cleanup-verified`; tests are no longer present in the working project. See the [project README](project-overview.md) for service credentials and deployment.

For Render Free and Supabase Free, follow [the setup and testing guide](render-supabase.md).
`npm run db:check` verifies your configured database. `npm run db:import` copies
existing SQLite data into an empty PostgreSQL database. Both are available from the `server/` folder. Queries and transactions are awaited so the
same code works with a local SQLite connection and a remote PostgreSQL pool.

The interim domain entities now have relational storage for resumes, portfolios,
profiles, themes, projects, skills, experience, education, certificates and links.
For the mapping, backups and migration command (`npm run db:normalize`), see the
[relational database guide](relational-database.md). The app retains its
existing API while reconstructing content from those rows.
