# Resume import

The `/resume/import` route opens a native modal over the resume workspace. It has file and pasted-text tabs, drag and drop, cancellable extraction progress, and a compact review before saving. Uploaded files are not saved automatically. Imported resumes have `origin: "import"` and do not count toward the account's manually created resume quota. Existing manual resumes cannot change their origin; template access and portfolio limits remain governed by the plan.

## Extraction and placement

- PDF.js reads embedded text with coordinate-based reading order. Reading order is detected per section so a page can switch from full-width prose to side-by-side skill, certificate or language blocks. Adjacent contact fragments are joined; right-aligned dates and locations remain with their entry.
- Mammoth reads DOCX; TXT is read directly.
- Images and pages without usable embedded text use English Tesseract OCR in the browser. Worker, language data and WASM are self-hosted in `client/public/ocr`, so the file itself is not sent to an OCR provider.
- The shared parser splits recognizable jobs and qualifications, extracts explicit employment, education and certificate dates, keeps skill group headings with their sub-skills, separates spoken languages from certificates, joins wrapped descriptions, converts bullets to rich text, and removes duplicate contact blocks, page numbering and generic reference boilerplate.
- Ambiguous fields stay empty, descriptions remain editable, and review messages flag missing job/qualification metadata. The detected section order is retained.

This is structured content import into Linkfolio templates, rather than pixel-for-pixel reconstruction of the original document. Parsing is not guaranteed perfect: unfamiliar headings, unusual columns, handwriting, non-English scans and low-resolution images still need review. No accuracy percentage is claimed. Current checks use representative synthetic fixtures, including mixed-layout PDFs and a rendered resume image. A local resume PDF was also checked during the field-mapping correction. Existing saved imports retain their previous data; re-import the original file to apply the corrected extraction.

## Optional AI parsing

Set `OPENAI_API_KEY` in the server environment to enable the optional AI checkbox. `RESUME_IMPORT_MODEL` defaults to `gpt-4.1-mini` and can be changed to a model that supports Responses API structured output. The key never reaches the browser.

AI parsing sends only extracted text, and only after the user selects the checkbox. The request uses a strict JSON schema, instructs the model to preserve wording and omit unknown facts, and sets `store: false`. Refusals, truncated output, invalid fields and unavailable service fall back to local parsing with a visible review message. Schema compliance validates structure, not factual accuracy. A valid server key is needed to exercise the live provider; tests cover the request and response validation with a fake transport.

References: [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs), [Tesseract.js](https://github.com/naptha/tesseract.js), [PDF.js](https://mozilla.github.io/pdf.js/), [Mammoth](https://github.com/mwilliamson/mammoth.js).

Operational file-size, page-count and text-size bounds remain to protect the browser from oversized documents; there is no import-count quota.
