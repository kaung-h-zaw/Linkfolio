import { useLayoutEffect, useRef, useState } from 'react'
import { FiFileText, FiX } from 'react-icons/fi'
import ResumeEditorPreview from './ResumeEditorPreview'
import { RESUME_RENDER_WIDTH } from '../lib/resumePage'

export default function ResumeFocusedPreview({ profile, template, onExitPreview }) {
  const page = useRef(null)
  const [zoom, setZoom] = useState(100)

  useLayoutEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      setZoom(Math.round(Math.min(1, entry.contentRect.width / RESUME_RENDER_WIDTH) * 100))
    })
    observer.observe(page.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-2">
        <h2 className="flex items-center gap-2 text-sm font-medium text-ink">
          <FiFileText aria-hidden="true" className="h-4 w-4 text-accent" />
          Resume preview
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-xs tabular-nums text-muted">{zoom}% zoom</span>
          <button type="button" onClick={onExitPreview} aria-label="Close preview" title="Close preview (Escape)"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-line bg-paper text-muted hover:text-ink">
            <FiX aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain" role="region" aria-label="Scrollable resume pages" tabIndex={0}>
        <div ref={page} className="mx-auto w-full" style={{ maxWidth: RESUME_RENDER_WIDTH }}>
          <ResumeEditorPreview profile={profile} template={template} />
        </div>
      </div>
    </div>
  )
}
