import { useEffect, useRef } from 'react'
import { selectableResumeTemplates } from '../resumeTemplates'
import ResumePreview from '../ResumePreview'
import Icon from '../Icon'
import { useTemplateAccess } from '../../lib/templateAccess'

export default function DesignTemplatePicker({ profile, selected, onSelect, onClose }) {
  const ref = useRef(null), opener = useRef(null)
  const access = useTemplateAccess()
  useEffect(() => {
    if (!opener.current) opener.current = document.activeElement
    const overflow = document.body.style.overflow
    ref.current.showModal()
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = overflow; opener.current?.focus({preventScroll:true}) }
  }, [])
  return <dialog ref={ref} onClose={onClose} onClick={event=>{if(event.target===ref.current)ref.current.close()}} aria-labelledby="template-picker-title" className="resume-template-dialog-minimal">
    <header className="resume-template-minimal-header">
      <h2 id="template-picker-title">Choose a resume template</h2>
      <button autoFocus type="button" onClick={()=>ref.current.close()} aria-label="Close resume templates"><Icon name="close" className="h-5 w-5"/></button>
    </header>
    <div className="resume-template-minimal-scroll">
      <div className="resume-template-minimal-grid">
        {selectableResumeTemplates.map(template=>{
          const active=selected===template.id,permission=access(template.id,'resume')
          return <button key={template.id} type="button" className="resume-template-minimal-card" disabled={!permission.allowed} aria-label={`Use ${template.name} template`} aria-pressed={active} onClick={()=>{onSelect(template.id);ref.current.close()}}>
            <div className="template-thumbnail resume-template-minimal-preview"><div className="thumbnail-sheet absolute top-0 left-0" aria-hidden="true" inert><ResumePreview paginated={false} profile={{...profile,design:undefined}} template={template}/></div></div>
            <span className="resume-template-minimal-label"><span>{template.name}</span>{active?<Icon name="check" className="h-4 w-4"/>:!permission.allowed&&<span className="resume-template-minimal-access">{permission.enabled?'Premium':'Unavailable'}</span>}</span>
          </button>
        })}
      </div>
    </div>
  </dialog>
}
