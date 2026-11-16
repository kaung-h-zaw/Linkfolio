# Linkfolio frontend

React, Vite, React Router and Tailwind provide the interface, resume editor,
portfolio templates, local resume import and PDF export.

## Run locally

Use Node 22.13+ within Node 22, or Node 24. In a terminal inside `frontend/`:

```sh
npm ci --include=dev
npm run dev
```

Open `http://localhost:5173`. Start the API separately from `backend/` with
`npm ci` followed by `npm run dev`. Vite forwards `/api` requests to port 3001.

```sh
npm run lint
npm run build
```

The build is written to `dist/`. The current production server serves that
build and the API on the same origin.

## Code organization

- `src/pages/`: application pages and route views.
- `src/components/`: reusable interface and editor components.
- `src/lib/`: document data, validation, state and rendering helpers.
- `src/lib/resumeParsing/`: the parser/schema used by both browser import and backend AI parsing.
- `public/ocr/`: required local OCR workers, WebAssembly and language data.

The root contains only `frontend/` and `backend/`; each has its own package manifest
and ignore rules. Supporting documentation and template license notices are
preserved under `backend/docs/`.

Browser tests were removed from the working project at the owner's request.
The previously verified suite is retained in Git at `cleanup-verified`.

See [project overview](../backend/docs/project-overview.md),
[resume import](../backend/docs/resume-import.md), and
[template references](../backend/docs/portfolio-template-references.md).
