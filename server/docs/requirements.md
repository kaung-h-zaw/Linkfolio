# ISP requirement mapping

The initial proposal defines the original scope and free-plan limits. The interim report extends that scope; its twelve objectives and detailed use cases are the basis of this implementation. Academic submission instructions in the reports are document content, not operational instructions for the code.

| Report requirement | Implementation |
| --- | --- |
| Secure registration, login, logout; invalid/duplicate credentials | Server-validated accounts, salted scrypt password hashes, opaque sessions in HttpOnly cookies; protected workspace routes |
| Manage profile and resume information | Existing personal, summary, experience, education, skills, projects, certificates, language, and extra-section editors; account name settings |
| Structured persistent database | Existing account/publication tables plus relational resumes, portfolios, profiles, themes, portfolio settings and ordered professional sections; admins and reports exposed as read-only views |
| Generate portfolio from resume data | Generate action adds portfolio settings to the same document; both editors share professional content |
| External links and website resources | Existing profile-link and project editors; public clickable links |
| PDF export | PDF download in the resume toolbar; optional generated resume download on public portfolios |
| Templates, themes, responsive previews | Existing resume and portfolio templates, palettes, section layouts, device previews; server template availability and Premium checks |
| Custom URL and public/private controls (DUC-03) | Unique `/p/:slug` URLs; server blocks private/disabled-account portfolios; owner preview remains protected |
| Contact form (DUC-05) | Validated visitor form, rate limiting, stored owner inbox, read/unread status |
| Analytics (View Analytics; DUC-06 is duplicated in the interim) | Public page views, portfolio link clicks, last viewed date; empty states with zero counts |
| Basic administration (DUC-06) | Admin-only dashboard, enable/disable accounts, template availability/Premium settings, plan limits, system totals |
| Premium upgrade (DUC-04) | Free one-resume/one-portfolio limits, configurable Premium limits, local demo success/failure, Stripe hosted checkout with verified fulfillment |
| Forgot password alternative (DUC-01) | Expiring single-use reset tokens; SMTP email in production, local demonstration link during development |

## Implementation choices

- **Shared data:** a resume and its generated portfolio share one stored document, rather than making a stale copy. Portfolio themes/settings are independent of resume appearance. Publishing uses the current saved content; later saves update the public page. Unpublishing takes effect immediately.
- **Database detail:** professional fields now use relational profile, resume, portfolio, theme, project, skill, experience, education, certificate and link records. Reads reconstruct them from these rows; saves replace them atomically. Rich text and optional presentation metadata retain JSON representations, and the original document JSON remains a compatibility snapshot. Ownership and section relationships use foreign keys. See [the interim-to-final mapping](relational-database.md) for the supported differences from the proposed diagram.
- **Public projection:** hidden entries and disabled sections are excluded from public responses. Account details, draft metadata and owner-only records are not returned. Contact details appear only when Contact is enabled. An enabled resume download intentionally exposes the visible resume content and its contact details.
- **Templates:** the reports do not assign individual templates to a plan. Classic, Essential and Editorial default to free; the other existing styles default to Premium. An administrator can change those assignments.
- **Premium allowance:** the reports specify “more” documents without an exact Premium count. The initial allowance is 20 of each, editable by an administrator. Premium uses a one-time purchase because no recurring billing requirement or price is supplied.
- **Analytics:** counts represent page loads and link interactions, not unique visitors. Owner visits also count. No visitor identity is collected.
- **Messages:** the owner reads messages in the inbox. Replying uses the visitor's email link; automatic outbound replies are not part of the stated use case.
- **Account settings:** changing the account name affects new drafts; saved documents remain independently editable, allowing tailored resumes.

## External configuration

Real Stripe transactions and email delivery require the owner's service credentials. Both integrations are implemented, but they cannot be tested against an actual account without those credentials. Local demo flows are labelled and disabled in production. Hosting and a public domain are not configured by this code change; local public URLs become internet-accessible only when the app is deployed.

## UI and final-report review

See [the report alignment review](report-ui-alignment.md) for the resume, portfolio and analytics redesign, requirement mapping, outstanding final-report sections and verification evidence. The interim uses DUC-06 for both administration and analytics; assign a distinct identifier consistently when preparing the final report.
