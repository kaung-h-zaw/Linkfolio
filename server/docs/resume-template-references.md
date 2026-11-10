# Resume template references

Reviewed on October 5, 2026. These are editable adaptations of published references, not official or endorsed university templates. Preview names and achievements are fictional.

| Layout | Reference | Adopted conventions |
| --- | --- | --- |
| Harvard (`classic`) | [Harvard Mignone Center guide](https://careerservices.fas.harvard.edu/resources/create-a-strong-resume/), [published template](https://cdn-careerservices.fas.harvard.edu/wp-content/uploads/sites/161/2024/07/resume-paragraph.pdf) | Centered serif name and section labels, compact contacts, education first, monochrome rules and aligned metadata. The editable sample uses bullets. |
| MIT (`essential`) | [MIT CAPD guidance](https://capd.mit.edu/resources/resumes/), [sample collection](https://cdn.uconnectlabs.com/wp-content/uploads/sites/123/2025/05/Composite-resume-samples-1.pdf) | Single column, restrained sans-serif typography, bold headings, education first and achievement bullets. MIT publishes multiple examples, not one official template. |
| Bajaj Developer (`editorial`) | [Sourabh Bajaj's repository](https://github.com/sb2nov/resume), [LaTeX source](https://github.com/sb2nov/resume/blob/master/sourabh_bajaj_resume.tex) | Split name/contact header, serif typography, ruled small-cap headings, education/experience/projects ordering and aligned metadata. |

| Awesome CV (`slate`) | [Claud D. Park's Awesome CV](https://github.com/posquit0/Awesome-CV) | Centered name, red highlights and compact entries. Independent React/CSS implementation inspired by its visual conventions. |
| ModernCV Classic (`avenue`) | [ModernCV](https://github.com/moderncv/moderncv), Classic style | Blue name, square optional portrait, section accents and a date rail. |
| Deedy (`grid`) | [Debarghya Das's Deedy Resume](https://github.com/deedy/Deedy-Resume) | Asymmetric columns with education/skills on the left and experience on the right. |
| ModernCV Banking (`studio`) | [ModernCV](https://github.com/moderncv/moderncv), Banking style | Centered header, green accents and ruled headings. |
| AltaCV (`canvas`) | [LianTze Lim's AltaCV](https://github.com/liantze/AltaCV) | Circular optional portrait, plum accents, experience on the left and education/skills on the right. |
| Twenty One Seconds (`folio`) | [Alessandro Trinca Tornidor's Twenty One Seconds](https://github.com/trincadev/cv-latex-twentyoneseconds) | Pale sidebar with optional circular portrait and contacts; a wider experience column. |

Linkfolio uses its own React renderer, pagination, editable sections and A4 defaults. User design settings override defaults. The nine existing template IDs are retained; all nine now have published design references. Three templates support optional photo uploads.

The developer template format is MIT licensed; see [upstream license](sourabh-bajaj-resume-LICENSE.txt). No personal resume content from the repository is reproduced.

The six added layouts use independent React/CSS implementations of the referenced visual conventions; no LaTeX class code, bundled fonts, icons, or personal resume data is imported. References remain linked in each template preview. ModernCV, AltaCV, and Twenty One Seconds publish their implementations under LPPL; Deedy uses Apache 2.0, and Awesome CV's example documents specify CC BY-SA 4.0.

The gallery-only demonstration portrait is a locally stored [Unsplash image](https://images.unsplash.com/photo-1500648767791-00dcc994a43e). It is never inserted into a user's resume. Uploaded photos are resized to at most 480 pixels on the longer edge and stored in the user's document as JPEG data, so saving and PDF export do not require external image loading.
