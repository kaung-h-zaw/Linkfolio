import { memo, useLayoutEffect, useRef, useState } from 'react'
import ResumePreview from './ResumePreview'
import { RESUME_RENDER_WIDTH } from '../lib/resumePage'
import { sameResumeProfile } from '../lib/resumePreviewEqual'

function ResumeEditorPreview({ profile, template }) {
  const host = useRef(null)
  const [width, setWidth] = useState(RESUME_RENDER_WIDTH)
  useLayoutEffect(() => {
    const measure = () => {
      const available = host.current.clientWidth
      if (available > 0) setWidth(available)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(host.current)
    return () => observer.disconnect()
  }, [])
  return <div ref={host} className="resume-preview-fit">
    <div className="editor-resume resume-print-layout resume-print-canvas" style={{ width:RESUME_RENDER_WIDTH, zoom:Math.min(1, width / RESUME_RENDER_WIDTH) }}>
      <ResumePreview profile={profile} template={template} />
    </div>
  </div>
}
export default memo(ResumeEditorPreview,(previous,next) => previous.template === next.template && sameResumeProfile(previous.profile,next.profile))
