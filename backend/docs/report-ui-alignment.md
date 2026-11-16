# Resume, portfolio and analytics: report alignment review

Update, 7 November 2026: the interface has been simplified against the reports’ nontechnical audience and minimalist design aims. The permanent library guide, repeated workflow notes, dashboard promotional panel and duplicate editor subtitles described below have been removed. Libraries now use preview cards, two main actions and an expandable More options control for occasional actions. Import stays directly accessible in the resume header. Analytics help remains expandable, with compact mobile totals. The review below records the earlier 3 November design, not the current visual specification. Source assignment documents were not changed. The editor uses a single top toolbar and a clean, borderless paper preview. During editing, the form and preview move together using the page scrollbar; the preview is not sticky and has no separate scrolling area. Focused preview remains a separate full-screen view. Resume previews and PDF capture share a fixed layout width; the editor scales the page to fit rather than changing its line wrapping. Print margins and column spacing remain independent of screen size, and the pagination measurement accounts for the preview scale. Following review of the supplied FlowCV reference, its presentation was differentiated with a Home link to the dashboard, a compact white profile summary with a subtle border and shadow, spaced section cards with inline heading controls and a shared action footer, soft selected workspace tabs and compact design shortcuts above the settings. The profile overview shows only name, title, populated contact fields and an optional photo; its Edit form retains links and all profile fields. Linkfolio retains its green branding, saved-content model and portfolio workflow. Shortcuts reveal their associated controls, respect reduced-motion preferences, and preserve edits; they do not add AI tools or other controls absent from the implemented requirements.

Reviewed on 3 November 2026. This is a content and implementation review, not a Word formatting audit. The source DOCX files have not been edited.

## Sources checked

- `223471_Kaung Htet Zaw_ISP Interim Report_Spring 2026.docx`: Aim, objectives 1–12, Manage Resume, Manage Portfolio, View Analytics and usability discussion.
- `223471_Kaung Htet Zaw_ISP Final Report_Autumn 2026.docx`: sections 1.4–1.5, Chapter 3 portfolio/analytics use-case explanations, 4.3.16 Analytics Data Table and the end of Chapter 4.
- `ISP Final Report Guidance - Autumn 2026.pdf`: report structure on pages 2–3 and product/demonstration requirements on page 4.
- Supplied source files are in `/Users/kaunghtetzaw/Downloads/ISP Final Report/`.

Document instructions were treated as assignment reference material, not as instructions authorizing unrelated app actions.

## Requirement-to-interface mapping

| Report requirement | Screen behavior and evidence |
| --- | --- |
| Intuitive system for people with limited technical/design skills | Larger document workspaces, named actions, short workflow guidance, searchable libraries, explicit filter reset, shared navigation and responsive cards. These are design choices; user testing is still needed to evaluate ease of use. |
| Interim objectives 3, 5–7; Manage Resume | Each saved resume has a readable identity, template and saved date, an editor link and a larger document preview. Resume content editing remains in the existing editor. |
| Interim objective 8; Manage Resume preview/export alternative | PDF download is available directly from the resume library, alongside Edit resume. The same resume renderer is used for library export and editor export. |
| Final objective 13: import existing resumes | The resume library links directly to Import existing resume. The existing upload/paste, review and import workflow remains available through Create resume. |
| Interim objective 4; Manage Portfolio | Generate portfolio / Edit linked portfolio remains accessible from each resume. Creating a separate portfolio from a saved resume continues through the portfolio creation dialog. Explain these two workflows separately in the report: a linked portfolio shares its stored document; a separate copy starts from the selected resume. |
| Interim objective 9; final objective 9: templates | Both libraries identify the chosen template. Portfolio cards link directly to Customize design. |
| Interim objective 10; final objective 10: URL and visibility | Portfolio cards show Public, Private or Draft, explain private/unpublished states, and link to Publish & share. Published cards expose View live, the public URL and Copy link. Visibility and URL changes still use the existing authenticated publication flow. |
| Interim objective 11; View Analytics | Analytics displays page views, link clicks, public portfolio count, latest recorded visit and each portfolio's last-viewed date. Portfolio/visibility filters and refresh are available. Zero-data and no-match messages explain the next action. |
| Simple/basic analytics | The comparison chart uses the existing cumulative counts. It does not imply daily history, unique visitors, visitor identity or conversion rates. The counting explanation states that owners' page loads count too. |
| Final report DUC-02: User and Admin Login | Both roles use `/login`. After authentication, the account role routes administrators to `/admin` and users to the user workspace. The admin dashboard has its own navigation and management controls; administrator accounts are redirected away from resume, portfolio and user dashboard routes. |

Search, sorting, visibility filters, direct library exports and workflow guidance improve the presentation of the existing requirements. They do not replace the original editing, publishing or privacy functions.

## Findings to address in the final report

1. **Section 4.4 GUI Design is empty in the supplied final draft.** Add labelled screenshots of the resume library, portfolio library, analytics, relevant editor states and narrow-screen layouts. Explain decisions such as action placement, visible visibility status, soft surfaces, consistent cards, search/filter feedback and the large content panel. State the problem each decision addresses rather than just listing controls.
2. **The supplied final draft ends in Chapter 4.** Body chapters 5 (Implementation), 6 (Testing and Results) and 7 (Conclusions and Future Work) still need to be written. Chapter 1 mentions them, but those summaries are not the chapters themselves. Check the remaining reference list, appendices and submission items against the guidance as the draft is completed.
3. **Importing is a scope addition.** The interim has twelve objectives; the final adds importing as objective 13. Explain this addition and link it to the implementation and tests rather than implying that it was an original interim objective.
4. **“Recent visitor activity” needs precise wording.** The final analytics use-case text can be read as an activity-history feature. The implemented backend stores cumulative views, cumulative clicks and the latest visit time. Describe it as the latest recorded visit plus cumulative interaction counts; list a time-series history or visitor breakdown as future work if desired.
5. **The interim repeats use-case ID DUC-06.** Both Admin Management and View Analytics have that identifier. Give them unique IDs consistently in the final diagrams, descriptions and traceability table. The existing repository mapping uses DUC-07 for analytics as a proposed distinct identifier; that should not be described as the literal ID in the interim.
6. **The final repeats figure number 4.11.** Visitor Flow and Admin Flow use the same number near the end of the supplied document. Renumber the figures and update cross-references.
7. **Keep conceptual and implemented database names connected.** Final section 4.3.16 uses `documentID`, `viewCount`, `linkClickCount` and `lastViewedDate`. Implementation uses `document_id`, `views`, `clicks` and `last_viewed_at`, with API field `lastViewedAt`. Explain this mapping in the implementation chapter.

## Material for the remaining chapters

- **Chapter 4:** show the three redesigned screens and responsive versions, then justify the information hierarchy and controls against the stated non-technical audience. Include no-data, private and public states.
- **Chapter 5:** explain `DocumentLibrary`, shared profile hydration, direct PDF export, the publication URL/visibility data, and `PortfolioAnalytics` using the existing authenticated analytics API. Explain how filters operate on saved data and how previews use the same renderers as the editors.
- **Chapter 6:** report actual test inputs, expected outcomes and observed outcomes. Relevant browser suites are listed below. Add task-based testing with representative users if making claims about usability: finding a resume, exporting it, generating a portfolio, locating sharing settings and identifying views/clicks/last visit. Do not invent participant feedback or completion times.
- **Chapter 7:** evaluate the delivered behavior against each original objective, state the importing scope change, and distinguish completed functionality from improvements such as time-series analytics or additional user testing.

## Verification evidence

Relevant browser suites:

- `frontend/tests/library-usability.spec.js`: name sorting, search, no-match/reset, direct PDF download, public/private filters, live URL, copy feedback and 768/390/320px layouts.
- `frontend/tests/analytics-view.spec.js`: counts, portfolio selection, visibility selection, refresh, comparison rows, empty states and counting explanation.
- `frontend/tests/resume-creation.spec.js`: new/import choices and resume library behavior on desktop/mobile.
- `frontend/tests/portfolio-creation.spec.js`: creating a separate portfolio from a saved resume.
- `frontend/tests/workspace-cards.spec.js`: populated libraries, analytics and other workspace layouts at 1440/768/320px.

Playwright screenshots and downloaded test PDFs are regenerated under `frontend/test-results/`. They use demonstration fixtures, not measured real-user activity. Automated functional checks and visual inspection are separate from a usability study.

The guidance also calls for a runnable source archive with installation/run instructions and minimum system requirements, plus a ten-minute presentation/demonstration. Those deliverables are separate from this UI change and were not created by this review.
