import { getDesign } from './resumeDesign'
import { resumeTemplates } from '../components/resumeTemplates'
import { emptyProfile } from './profile'
import { textDocument } from './summary'
import { newExperience } from './experience'
import { newEducation, newSkill, skillLevels } from './educationSkills'
import { newProject, newCertification, newLanguage, languageLevels } from './additionalSections'
import { cleanResumeText, suggestPersonalDetails, parseResumeText } from '../../../shared/resumeParser.mjs'
import { pdfReadingOrder } from './pdfReadingOrder'

export { cleanResumeText, suggestPersonalDetails, parseResumeText }
const MAX_IMPORT_BYTES = 5 * 1024 * 1024
export const MAX_IMPORT_TEXT = 60000
const abort = (signal) => signal?.throwIfAborted()

// OCR runs on the device with self-hosted workers, models and WebAssembly.
async function createOcr(onProgress, signal) {
  const { createWorker } = await import('tesseract.js')
  abort(signal)
  const worker = await createWorker('eng', 1, {
    workerPath: '/ocr/worker.min.js', corePath: '/ocr/tesseract-core-lstm.wasm.js', langPath: '/ocr',
    logger: ({ status, progress }) => onProgress?.({ label: status === 'recognizing text' ? 'Reading scanned text…' : 'Preparing text recognition…', progress: Number.isFinite(progress) ? progress : 0 }),
  })
  const stop = () => { worker.terminate().catch(() => {}) }
  signal?.addEventListener('abort', stop, { once: true })
  if (signal?.aborted) { await worker.terminate(); abort(signal) }
  return { worker, close: async () => { signal?.removeEventListener('abort', stop); await worker.terminate().catch(() => {}) } }
}
export async function extractResumeText(file, { onProgress, signal } = {}) {
  if (!file.size) throw new Error('This file is empty. Choose another resume.')
  if (file.size > MAX_IMPORT_BYTES) throw new Error('Choose a resume smaller than 5 MB.')
  const extension = file.name.split('.').pop().toLowerCase()
  if (!['pdf', 'docx', 'txt', 'png', 'jpg', 'jpeg', 'webp'].includes(extension))
    throw new Error('Choose a PDF, Word .docx, TXT, PNG or JPG file.')
  let text
  let ocr
  try {
    abort(signal)
    onProgress?.({ label: 'Reading your file…', progress: 0.1 })
    if (extension === 'txt') text = await file.text()
    else if (extension === 'docx') {
      const { default: mammoth } = await import('mammoth/mammoth.browser')
      text = (await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })).value
    } else if (['png','jpg','jpeg','webp'].includes(extension)) {
      ocr = await createOcr(onProgress, signal)
      text = (await ocr.worker.recognize(file)).data.text
    } else {
      const pdfjs = await import('pdfjs-dist')
      const { default: workerUrl } = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl
      const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) })
      const stop = () => { task.destroy().catch(() => {}) }
      signal?.addEventListener('abort', stop, { once: true })
      try {
        const pdf = await task.promise
        if (pdf.numPages > 30) throw new Error('Import a resume with 30 pages or fewer.')
        const pages = []
        for (let index = 1; index <= pdf.numPages; index++) {
          abort(signal)
          const page = await pdf.getPage(index)
          const content = await page.getTextContent()
          const viewport = page.getViewport({ scale: 1 })
          let pageText = pdfReadingOrder(content.items, viewport.width)
          if (pageText.replace(/\s/g, '').length < 20) {
            ocr ||= await createOcr(onProgress, signal)
            const scaled = page.getViewport({ scale: Math.min(2, 2000 / Math.max(viewport.width, viewport.height)) })
            const canvas = document.createElement('canvas')
            canvas.width = Math.ceil(scaled.width); canvas.height = Math.ceil(scaled.height)
            await page.render({ canvasContext: canvas.getContext('2d'), viewport: scaled }).promise
            pageText = (await ocr.worker.recognize(canvas)).data.text
            canvas.width = 0; canvas.height = 0
          }
          pages.push(pageText)
          onProgress?.({ label: `Read page ${index} of ${pdf.numPages}`, progress: index / pdf.numPages })
          page.cleanup()
        }
        text = pages.join('\n\n')
      } finally {
        signal?.removeEventListener('abort', stop)
        await task.destroy()
      }
    }
    abort(signal)
  } catch (error) {
    if (signal?.aborted) throw new DOMException('Import cancelled', 'AbortError')
    if (error.name === 'PasswordException') throw new Error('This PDF is password protected. Export an unlocked copy first.', { cause: error })
    if (error.message.includes('30 pages')) throw error
    throw new Error('Could not read this file. Try another copy or paste its text.', { cause: error })
  } finally { await ocr?.close() }
  text = cleanResumeText(text)
  if (!text) throw new Error('No readable text was found. Try a clearer scan or paste your resume text.')
  if (text.length > MAX_IMPORT_TEXT) throw new Error('This resume is too long. Import up to 60,000 characters.')
  return text
}

function descriptionDocument(value) {
  const lines = String(value || '').split('\n').map((line) => line.trim()).filter(Boolean)
  const content = []
  for (const line of lines) {
    const match = /^[•●▪◦‣*–-]\s*(.*)/.exec(line)
    if (match) {
      if (content.at(-1)?.type !== 'bulletList') content.push({ type: 'bulletList', content: [] })
      content.at(-1).content.push({ type: 'listItem', content: textDocument(match[1]).content })
    } else content.push(...textDocument(line).content)
  }
  return { type: 'doc', content }
}
export function createImportedResume(source, personal, name, templateId = 'essential', structured) {
  const text = cleanResumeText(source)
  if (!text) throw new Error('Add your resume text before importing.')
  if (text.length > MAX_IMPORT_TEXT) throw new Error('Import up to 60,000 characters.')
  const parsed = structured || parseResumeText(text)
  const profile = {
    ...emptyProfile, id: crypto.randomUUID(), kind: 'resume', origin: 'import',
    name: name.trim() || 'Imported resume', templateId,
    personal: { ...emptyProfile.personal, ...parsed.personal, ...personal,
      links: (personal?.links || parsed.personal.links || []).map((link) => ({ ...link, id: link.id || crypto.randomUUID() })) },
    design: getDesign({ ...resumeTemplates.find((item) => item.id === templateId)?.defaults, sectionOrder: parsed.sectionOrder || [] }),
    extraContent: (parsed.extras || []).map((item) => ({ type: item.type, heading: item.heading,
      entries: [{ id: crypto.randomUUID(), visible: true, name: '', content: descriptionDocument(item.description) }] })),
  }
  const assign = (type, heading, entries, base) => {
    if (!entries?.length) return
    profile[type + 'Section'] = { heading, entries: entries.map(({ description, ...item }) => {
      if (type === 'skills' || type === 'languages') {
        const levels = type === 'skills' ? skillLevels : languageLevels
        const original = item.level || ''
        item.level = levels.includes(original) ? original : /native|bilingual/i.test(original) && type === 'languages' ? 'Native/Bilingual' : ''
        if (original && !levels.includes(original) && !/^(?:native|bilingual)$/i.test(original)) description = [description, original].filter(Boolean).join('\n')
      }
      return { ...base(), ...item, content: descriptionDocument(description) }
    }) }
  }
  if (parsed.summary) profile.summarySection = { heading: 'Summary', entries: [{ id: crypto.randomUUID(), visible: true, content: descriptionDocument(parsed.summary) }] }
  assign('experience', 'Professional Experience', parsed.experience, newExperience)
  assign('education', 'Education', parsed.education, newEducation)
  assign('skills', 'Skills', parsed.skills, newSkill)
  assign('languages', 'Languages', parsed.languages, newLanguage)
  assign('projects', 'Projects', parsed.projects, newProject)
  assign('certifications', 'Certifications', parsed.certifications, newCertification)
  return profile
}
