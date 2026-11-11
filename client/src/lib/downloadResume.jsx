import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import ResumePreview from '../components/ResumePreview'
import { RESUME_RENDER_WIDTH } from './resumePage'
import { addPdfTextLayer } from './pdfTextLayer'
import { resumeTemplates } from '../components/resumeTemplates'

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve))

export async function downloadResume(profile) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas-pro'), import('jspdf'),
  ])
  const host = document.createElement('div')
  host.setAttribute('aria-hidden', 'true')
  host.inert = true
  host.style.cssText = `position:fixed;left:-10000px;top:0;width:${RESUME_RENDER_WIDTH}px;pointer-events:none;`
  document.body.appendChild(host)
  const root = createRoot(host)
  try {
    const template = resumeTemplates.find((item) => item.id === profile.templateId) || resumeTemplates[0]
    flushSync(() => root.render(<div className="editor-resume resume-print-layout"><ResumePreview profile={profile} template={template} /></div>))
    await document.fonts.ready
    await Promise.all([...host.querySelectorAll('img')].map((image) => image.decode().catch(() => {})))
    // Allow the shared document renderer to finish paginating at export width.
    await nextFrame()
    await nextFrame()
    const pages = [...host.querySelectorAll('.resume-page')]
    if (!pages.length) throw new Error('The resume could not be prepared. Please try again.')
    const format = profile.design?.page === 'Letter' ? 'letter' : 'a4'
    const pdf = new jsPDF({ unit: 'mm', format, compress: true })
    pdf.setProperties({ title: `${profile.personal.fullName || 'Resume'} — Resume`, creator: 'Linkfolio' })
    for (const [index, page] of pages.entries()) {
      const canvas = await html2canvas(page, { scale: 2, backgroundColor: '#ffffff', logging: false, windowWidth: 1200 })
      if (index) pdf.addPage(format)
      const width = pdf.internal.pageSize.getWidth()
      const height = pdf.internal.pageSize.getHeight()
      pdf.addImage(canvas, 'PNG', 0, 0, width, height, undefined, 'FAST')
      if (template.searchablePdf || template.reference === 'ats') addPdfTextLayer(pdf, page, width, height)
      const bounds = page.getBoundingClientRect()
      for (const link of page.querySelectorAll('a[href]')) {
        const rect = link.getBoundingClientRect()
        pdf.link((rect.left - bounds.left) / bounds.width * width,
          (rect.top - bounds.top) / bounds.height * height,
          rect.width / bounds.width * width, rect.height / bounds.height * height, { url: link.href })
      }
    }
    const name = (profile.personal.fullName || 'Resume').replace(/[<>:"/\\|?*]/g, '').split('').filter((character) => character.charCodeAt(0) >= 32).join('').trim() || 'Resume'
    pdf.save(`${name} - Resume.pdf`)
  } finally {
    root.unmount()
    host.remove()
  }
}
