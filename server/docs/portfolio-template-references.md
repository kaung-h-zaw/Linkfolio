# Portfolio design references

The gallery offers nine React adaptations of real, published web templates. They use the original layout ideas and typography hierarchy, while integrating Linkfolio's editable resume content, section controls, navigation, contact form and publishing. These are adaptations, not the original template packages or exact replicas. Older saved styles remain renderable. The three contemporary references appear first and Bentofolio is the default for new portfolios. The Macfolio adaptation uses the window framing for real projects rather than importing the source’s sample testimonials; window controls are decorative.

| Gallery design | Original | Preserved design features | Suggested images |
| --- | --- | --- | --- |
| Bentofolio | [Wafastarz](https://github.com/mkhoirulwafa18/bentofolio) · [live demo](https://lavanya-bentofolio.vercel.app) | Charcoal and peach connected cards, portrait panel, project rail, contact tile | Tall portrait; project images |
| Macfolio | [msafdev](https://github.com/msafdev/macfolio) · [live demo](https://macfolio-demo.vercel.app) | Dotted canvas, centered introduction, framed work window with decorative window controls | Optional portrait; product screenshots |
| Chiang Developer | [Brittany Chiang v4](https://github.com/bchiang7/v4) · [live demo](https://v4.brittanychiang.com) | Navy/mint palette, large introduction, numbered sections, alternating project images and overlapping description panels | Optional portrait; actual project screenshots |
| Strata | [HTML5 UP](https://html5up.net/strata) | Dark portrait sidebar, restrained introduction, recent-work grid | Personal portrait; actual project screenshots |
| Miniport | [HTML5 UP](https://html5up.net/miniport) | Dark navigation, circular portrait with introduction, light work cards | Portrait; landscape project covers |
| Editorial | [HTML5 UP](https://html5up.net/editorial) | Red masthead rule, serif headline, split image introduction, work grid | Workspace photo; screenshots or finished work |
| Massively | [HTML5 UP](https://html5up.net/massively) | Large uppercase introduction over photography; white editorial project grid | Wide landscape cover; large project images |
| Multiverse | [HTML5 UP](https://html5up.net/multiverse) | Dark, edge-to-edge image gallery with captions | Photography, illustrations, or screenshots of actual work |
| Freelancer | [Start Bootstrap](https://startbootstrap.com/theme/freelancer) | Navy navigation, teal portrait hero, centered headings and project grid | Portrait; project artwork or screenshots |

HTML5 UP designs by AJ are licensed under [CC BY 3.0](https://html5up.net/license). Public and editor previews retain a linked design attribution and identify the adaptation. Start Bootstrap Freelancer is [MIT licensed](https://github.com/StartBootstrap/startbootstrap-freelancer/blob/master/LICENSE); its notice is retained in `portfolio-freelancer-LICENSE.txt`. No source JavaScript was imported. Demo HTML/CSS were reviewed from each source's `/uploads/demos/` page.

The three contemporary references are MIT licensed; their notices are retained in `portfolio-bento-LICENSE.txt`, `portfolio-macfolio-LICENSE.txt` and `portfolio-nocturne-LICENSE.txt`. Brittany Chiang requests attribution; the rendered footer links to her website. Source components and Bentofolio’s published desktop screenshot were reviewed; author photos, project assets, fonts and personal copy were not imported.

## Images

No generated raster art is used in these nine designs. Gallery-only sample images are real Unsplash photos; they are not automatically assigned to a user's portfolio or represented as the user's work. Users upload their portrait, cover, and per-project images in Portfolio Content. The Personal photo controls let users choose Use resume photo or Use custom photo and independently turn Show personal photo on or off. The setting applies in the editor and on the published page. Switching sources preserves the custom upload. Custom mode never falls back to the resume photo when its upload is removed. Turning photos off keeps the private upload for later reuse but removes the portrait bytes from the public portfolio response. Files are resized to at most 1,200 pixels, stored with the saved portfolio, and rendered in previews and published pages. Removing an upload removes its saved assignment. Hidden project images are filtered from the public response.

Demo files, downloaded under the [Unsplash license](https://unsplash.com/license):

- `resume-demo.jpg`: existing portrait demo, documented in `resume-template-references.md`.
- `portfolio-workspace.jpg`: https://images.unsplash.com/photo-1498050108023-c5249f4df085
- `portfolio-desk.jpg`: https://images.unsplash.com/photo-1487014679447-9f8336841d58
- `portfolio-analytics.jpg`: https://images.unsplash.com/photo-1460925895917-afdab827c52f

Use a clear portrait for identity, a wide photo for a cover, and actual product screenshots, artwork or photographs for projects. Stock images are only examples in the gallery. Uploads support JPG, PNG and WebP up to 5 MB each; saved images have bounded total size.

## October 2026 rebuild

Revisited the original live demos, rather than using recolored generic resume blocks:

- Bentofolio: connected asymmetric intro/portrait/about/contact tiles and a separate work rail.
- Macfolio: dotted desktop canvas, window toolbar, inset project gallery and quiet profile.
- Chiang v4: oversized name, numbered headings, mint outline actions and overlapping alternating projects.
- Strata: portrait sidebar and a restrained recent-work column.
- Miniport: round portrait, white split introduction and boxed work cards.
- Editorial: serif introduction, red masthead rule, split cover and divided articles.
- Massively: cinematic cover introduction and centered article grid.
- Multiverse: edge-to-edge image tiles and compact captions.
- Freelancer: navy navigation, centered teal masthead and a three-column gallery.

Official demo URLs researched: https://html5up.net/uploads/demos/strata/, https://html5up.net/uploads/demos/miniport/, https://html5up.net/uploads/demos/editorial/, https://html5up.net/uploads/demos/massively/, https://html5up.net/uploads/demos/multiverse/, https://startbootstrap.github.io/startbootstrap-freelancer/, https://v4.brittanychiang.com/ and the Bentofolio/Macfolio repositories above.

All nine now share the same renderer, section model and design editor. Section cards expose visible entry counts, editable headings, ordering, visibility and layout without separate template-specific editing workflows. Tinted panel options were removed; old saved panel layouts render as plain reading/contact sections. Legacy portfolio IDs resolve to a matching current source-inspired composition so old portfolios also receive the rebuilt layouts. Shared customization overrides remain independent of template choice. These are adaptations for Linkfolio content, not exact copies of the demos.

## Original Linkfolio collection

The user clarified that the portfolios should be original Linkfolio designs informed by web research, rather than recreations of named web templates. The previous direct adaptations have therefore been replaced with new compositions and a newly written theme stylesheet:

- Mosaic: ivory/cobalt asymmetric introduction and inset modules.
- Workbench: warm industrial rules, labels and a project board.
- Signal: black/ivory/lime typography and a two-sided developer work index.
- Meridian: an ivory personal column and terracotta editorial rules.
- Clear: blue/white typography, fine dividers and open work summaries.
- Folio: paper-toned serif masthead and uninterrupted image ribbon.
- Panorama: bright cover story and a lead project beside compact followups.
- Aperture: dark asymmetric three-column visual gallery.
- Summit: blue/gold professional masthead with a tall portrait frame.

The saved IDs remain stable for compatibility, but the public names, compositions, hero markup and theme CSS belong to this original collection. Reference links are presented as inspiration in the editor; original designs show Made with Linkfolio in the public footer. Earlier upstream license files remain in the repository as historical provenance, without using the upstream template packages for the new rendering.
