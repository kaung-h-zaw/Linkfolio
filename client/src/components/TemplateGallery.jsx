import { useEffect, useRef, useState } from 'react'
import { Logo } from './Navbar'
import Icon from './Icon'
import ResumePreview from './ResumePreview'
import { selectableResumeTemplates, sampleProfile } from './resumeTemplates'
import { useTemplateAccess } from '../lib/templateAccess'
import { Link } from 'react-router-dom'

export default function TemplateGallery({selected,onChoose,onBack,hasStarted,embedded=false}) {
  const [filter,setFilter]=useState('All templates')
  const [preview,setPreview]=useState(null)
  const access=useTemplateAccess(),dialog=useRef(null)
  useEffect(()=>{
    if(!preview)return
    const element=dialog.current,previous=document.activeElement,overflow=document.body.style.overflow
    element.showModal();document.body.style.overflow='hidden'
    return ()=>{element.close();document.body.style.overflow=overflow;previous?.focus()}
  },[preview])
  const templates=selectableResumeTemplates.filter(template=>filter==='All templates'||template.category===filter)
  return <div className={`resume-template-gallery ${embedded?'':'standalone-template-gallery'}`}>
    {!embedded&&<header className="gallery-brand"><Logo/>{hasStarted&&<button onClick={onBack} className="button button-outline">Back to editor</button>}</header>}
    <div className="gallery-content">
      {embedded&&hasStarted&&<button type="button" onClick={onBack} className="gallery-back"><Icon name="moveUp" className="h-4 w-4 -rotate-90"/>My resumes</button>}
      <div className="gallery-heading"><h1 tabIndex={-1}>Choose a resume template</h1><p>Pick a layout to get started. Customize it as you go.</p></div>
      <div className="gallery-filters" role="group" aria-label="Template categories">
        {['All templates',...new Set(selectableResumeTemplates.map(template=>template.category))].map(category=><button key={category} type="button" aria-pressed={filter===category} onClick={()=>setFilter(category)}>{category}</button>)}
      </div>
      <div className="gallery-template-grid">{templates.map(template=><button key={template.id} type="button" onClick={()=>setPreview(template)} aria-label={`Preview ${template.name} template`} aria-haspopup="dialog" className="gallery-template-card">
        <div className="gallery-card-preview"><div className="template-thumbnail gallery-card-paper"><div aria-hidden="true" inert className="thumbnail-sheet"><ResumePreview profile={sampleProfile} template={template}/></div></div></div>
        <div className="gallery-card-label"><span className="gallery-card-info"><span>{template.name}</span><span>{template.category}</span></span><span className="gallery-preview-action" aria-hidden="true"><Icon name={selected===template.id&&hasStarted?'check':'eye'} className="h-4 w-4"/><span>{selected===template.id&&hasStarted?'Selected':'Preview'}</span></span></div>
      </button>)}</div>
      {preview&&<dialog ref={dialog} aria-labelledby="template-title" onCancel={()=>setPreview(null)} onClick={event=>{if(event.target===dialog.current)setPreview(null)}} className="resume-template-preview-dialog">
        <header><div><h2 id="template-title">{preview.name}</h2><p>{preview.category}</p></div><button autoFocus type="button" aria-label="Close template preview" className="gallery-close" onClick={()=>setPreview(null)}><Icon name="close" className="h-5 w-5"/></button></header>
        <div className="gallery-dialog-body">
          <div className="gallery-dialog-preview"><div className="template-thumbnail"><div aria-hidden="true" inert className="thumbnail-sheet"><ResumePreview profile={sampleProfile} template={preview}/></div></div></div>
          <div className="gallery-dialog-actions">
            <p className="text-sm leading-6 text-muted">{preview.description}</p>
            <p className="gallery-format">A4<span>·</span>{preview.photo?'Optional photo':'Text header'}</p>
            <button type="button" disabled={!access(preview.id,'resume').allowed} onClick={()=>onChoose(preview)} className="button button-green">{access(preview.id,'resume').allowed?'Use this template':access(preview.id,'resume').enabled?'Premium template':'Template unavailable'}<Icon name="arrow" className="h-4 w-4"/></button>
            {access(preview.id,'resume').premium&&!access(preview.id,'resume').allowed&&<Link to="/premium" className="gallery-source">View Premium</Link>}
          </div>
        </div>
      </dialog>}
    </div>
  </div>
}
