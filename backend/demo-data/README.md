# ISP report sample data

Run `npm run db:seed-demo` from `backend/` to add five fictional accounts and
their sample resumes, portfolios, inbox messages, and analytics to the existing
local database at `backend/data/linkfolio.sqlite`. The script refuses to create
a new database or connect to PostgreSQL. It does not change the schema or create
payment records.

The seed is repeatable and uses the application's scrypt password hashing. All
five accounts use the demo-only password `LinkfolioDemo!2026`:

| Account | Email | Plan | Resume | Portfolio |
|---|---|---|---|---|
| John Doe | `john.doe@example.com` | Free | Classic Serif | Miniport |
| Jane Smith | `jane.smith@example.com` | Free | Editorial Rule | Bento Grid |
| Michael Johnson | `michael.johnson@example.com` | Free | Precision Line | Sidebar |
| Emily Davis | `emily.davis@example.com` | Premium | Rose Letter | Professional |
| David Wilson | `david.wilson@example.com` | Premium | Atlantic Blue | Creative |

Each account has a different resume template and a different portfolio template.
The demo resumes include two work roles, five skills, two detailed projects, and
a certification. Each portfolio has its own introduction and project case
studies with local bundled cover images. Project image/detail settings are part
of each demo document, so they appear in editor previews and published pages.

The existing admin account is preserved. Before cleanup of any recognizable
records from the earlier seed, the script writes an integrity-checked safety
copy under `backend/data/backups/`. The safety copy is not the final submission
backup. No final database backup is generated; create that separately when
ready.

Start the backend from `backend/` with `npm start`, then start the frontend from
`frontend/` with `npm run dev`. Open `http://localhost:5173` to test the sample
accounts and their published portfolio pages.

The five fictional profile portraits are local copies from the [Random User
Generator](https://randomuser.me/), whose [copyright page](https://randomuser.me/copyright)
describes the images as selected from its authorized UI Faces collection. They
are included only as sample profile photos for the demo accounts.
