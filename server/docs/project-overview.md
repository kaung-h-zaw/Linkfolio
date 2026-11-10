# Linkfolio

The visible project root contains two application folders:

```text
linkfolio/
  client/                 React views, assets, validation and import helpers
  server/                 Express routes, controllers, models and documentation
```

Hidden Git metadata remains at the root so existing history and recovery tags
are preserved. Each application folder has its own `.gitignore` and `package.json`.

## Development

Use two terminals:

```sh
cd client
npm ci --include=dev
npm run dev
```

```sh
cd server
npm ci
npm run dev
```

Open `http://localhost:5173`. The frontend forwards `/api` to
`http://localhost:3001`. No root npm command is needed.

Run `npm run lint` in each folder. Run `npm run build` in `client/`.
The backend linter uses the existing tools installed in `client/`.

## Source and data preservation

The former top-level parser directory is now `client/src/lib/resumeParsing/`.
Both browser and backend imports point there. The backend also retains its
existing imports of pure validators from `client/src/lib/`; the two source
folders remain in one repository. No duplicated parser was introduced.

Documentation, diagrams and third-party license notices are preserved in this
`server/docs/` directory. Existing local database files and backups remain in
`server/data/` and are ignored by Git. Do not include private data, actual `.env`
files or installed `node_modules` folders in a teacher-submission archive.

Tests, the combined development script, and Render configuration had already
been deleted by the owner before this reorganization. They were not restored.
The earlier complete source and tests remain recoverable at `cleanup-verified`.

## Hosting

The existing production setup serves `client/dist` from Express. Build the
client, then start the server with production environment variables. See the
[server instructions](../README.md) and [client instructions](../../client/README.md).
Build/install commands from a hosting checkout's root can use:

```sh
npm --prefix server ci
npm --prefix client ci --include=dev
npm --prefix client run build
npm --prefix server start
```

Serving the client and API on separate origins would also require API-address,
CORS and cookie configuration. This reorganization changes source locations,
not the hosting topology, UI, database format or application features.

## Verification of this layout

Client lint, server lint and the client production build passed. The archived
test suite was run against the reorganized source in a temporary copy outside
this project: 57 browser tests passed, and 62 backend tests passed with 5
PostgreSQL tests skipped. Tests were not restored into the submission folders.
Both local development servers responded successfully, and the saved database
contents matched the pre-move backup. No deployment or remote push was performed.
