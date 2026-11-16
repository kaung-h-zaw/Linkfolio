# Relational database aligned with the interim report

The final application keeps the working account, publication, messaging,
analytics and payment tables and adds real relational storage for the domain
concepts in interim Figure 15. These tables are written by the application and
used to reconstruct editor and public portfolio responses; they are not empty
placeholders added for a diagram.

## Interim-to-final mapping

| Interim concept | Final storage | Reason / relationship |
| --- | --- | --- |
| User | `users` | Owns `documents`; salted password hash and opaque login sessions |
| Admin | `admins` view over `users` | `role = 'admin'`; no second password/account record |
| Resume | `resumes` | One per resume document; title and template reference |
| Portfolio | `portfolios` | One per portfolio-enabled document; optional `resume_id` for linked resume content |
| Profile | `profiles` | One per document, so tailored resumes can retain different contact details |
| Theme | `themes` | At most one resume theme and one portfolio theme per document |
| PortfolioSetting | `portfolio_settings` + `publications` | Contact/download and extended presentation settings; custom URL and visibility stay in `publications` |
| ContactMessage | `messages` | Existing owned inbox and public contact form continue to work |
| Analytics | `analytics` | Existing document-level views, clicks and last-viewed date |
| Template | `templates` | Composite key `(id, kind)` distinguishes resume and portfolio templates |
| PremiumPlan | `plans` | Free/Premium document limits; checkout price remains configured in Stripe |
| Project | `projects` | Ordered entries, visible flags, typed project fields and rich text |
| Skill | `skills` | Ordered skill entries and level; legacy skill strings remain supported |
| Experience | `experiences` | Ordered jobs with employer, dates, location and rich text |
| Education | `educations` | Ordered schools/degrees, dates, location and rich text |
| Certificate | `certificates` | Ordered certifications, issuer, dates, expiry flag and rich text |
| Link | `links` | Ordered personal and older document links, isolated by document and section |
| Report | `reports` view | Current user/document/portfolio/message/payment totals without stale duplicated summaries |

`documents`, `document_sections` and `relational_documents` support the editor
and migration. `sessions`, `password_resets` and `payments` remain useful final
system additions. There are 23 application tables and two read-only views.

## What is normalized and what remains JSON

Core profile fields, resume and portfolio records, selected templates, themes,
portfolio settings and the six professional collections are relational rows.
Each section retains its order and heading. The section primary key is
`(document_id, section_key)`; entry rows use
`(document_id, section_key, position)`, preserving repeated IDs in older drafts
without overwriting another document's entries. Client-visible entry IDs are
stored separately as `entry_id`.

Rich text is structured content and remains JSON text in a dedicated `content`
column. Unmapped optional presentation data remains in `extra_data` to preserve
images, attachments, future editor options and custom sections. `present_fields`
retains the distinction between omitted fields and empty values. Resume and
portfolio appearances can differ while their professional content stays shared.

`documents.data` is retained as a lossless editor snapshot for backward
compatibility and import. Normal reads reconstruct structured sections from the
new tables, so changing an existing normalized column is reflected in editor and
public responses. New app saves update the snapshot and all structured rows in
one transaction. The stored snapshot hash allows a legacy direct SQL import to
remain readable until it is backfilled. An unchanged snapshot does not overwrite
normalized records when the app restarts.

Sections outside the interim diagram (summary, languages and custom content)
remain in the editor snapshot. This migration does not pretend every flexible
editor property is a separate SQL table.

## Keys and data integrity

- Deleting a document cascades to its profiles, themes, resume/portfolio data,
  section metadata and entries, as well as the existing public records.
- A generated portfolio references its resume. A standalone portfolio has a null
  resume reference; it still owns its own profile and content through Document.
- Section entries reference their section metadata with a composite foreign key.
- Visibility and current/expiry flags use checked integer booleans (0/1).
- URLs/visibility remain protected by the existing unique slug and owner checks.
- Template references and `users.plan` continue to be validated in application
  code. They are not falsely labelled as SQL foreign keys.
- Administrator operations continue to require the admin user role. The `admins`
  view excludes password hashes and sessions. `reports` is an aggregate view.
- Dates remain stored as strings and IDs remain strings, rather than changing
  existing identifiers to the interim diagram's proposed integer IDs.

## Migrate and verify

From the `backend/` folder:

```sh
npm run db:normalize
```

This uses `backend/.env`, just like the app. For SQLite, it takes a consistent
backup first, applies the additive schema transaction, backfills existing
snapshots, checks foreign keys and verifies that previously unconverted editor
payloads round-trip exactly. By default backups are saved under
`backend/data/backups/`, which is excluded from source control.

To explicitly migrate a local SQLite file regardless of `DATABASE_URL`:

```sh
npm run db:normalize -- --sqlite /absolute/path/to/linkfolio.sqlite
```

The server also applies the idempotent schema/backfill at startup. Restart an
already-running backend after updating the code so new writes use relational
storage. Do not keep an old backend process writing during a deployment.

PostgreSQL uses the same relational schema in the private `linkfolio` schema.
Startup takes advisory locks for migration and row locks for backfill; failed
changes roll back. Before upgrading a hosted database, take a provider backup or
SQL dump. Running this command with a configured PostgreSQL URL modifies that
configured database. The local SQLite backup does not back up PostgreSQL.

The SQLite-to-PostgreSQL importer copies the original document snapshots and
rebuilds the structured rows inside its import transaction, so older SQLite
sources do not need to have the new tables first.

## Restoring the SQLite backup

Stop the backend. Keep the current SQLite file and any WAL/SHM files together as
an archive, then restore the backup as `backend/data/linkfolio.sqlite`. Restart
with the matching backed-up server code if you want the pre-migration schema;
restarting the updated server will migrate the restored file again. Never copy
only a live database file without its WAL; use the provided backup command.

## Validation

The backend tests cover old-draft backfill, exact JSON round trips, relational
reads, ordering, hidden entries, independent document ownership, transaction
rollback, standalone and linked portfolios, cascade deletion, reports and admin
roles. PostgreSQL-specific cases use a separate temporary database, never an
application database. The existing browser workflow checks remain applicable.

## Report wording

> The final database was expanded from the initial shared document storage to
> include relational records for resumes, portfolios, profiles, themes, projects,
> skills, experience, education, certificates and links. Existing data was
> migrated without changing the editor API. Rich text and optional presentation
> metadata remain structured JSON, while ownership, ordering and document
> relationships are enforced by relational keys. Administrators remain user
> accounts with an admin role, and system reports are calculated through views.
