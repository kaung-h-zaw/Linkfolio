import { getProjects } from '../../lib/additionalSections'
import { portfolioDemoImages } from '../../lib/portfolioImages'
import PortfolioPreview from '../PortfolioPreview'
import Icon from '../Icon'
import { sampleProfile } from '../resumeTemplates'
import { defaultPortfolio } from '../../lib/portfolio'
import { useEffect, useRef, useState } from 'react'
import { getPortfolioTemplate, sourcedPortfolioTemplates } from '../../lib/portfolioTemplates'
import { useTemplateAccess } from '../../lib/templateAccess'

const details = {
  miniport:['Clean & focused','Open typography · Simple lists'],
  nocturne:['Built for your work','Numbered sections · Project cards'],
  multiverse:['Let your work stand out','Large images · Expressive color'],
  freelancer:['A confident first impression','Structured sections · Serif headings'],
  strata:['A different perspective','Side navigation · Editorial content'],
  bento:['A place for everything','Mixed cards · Modular layout'],
}

// Render real layouts with the user's content, using each template's original styling.
function TemplateThumbnail({ template, profile, settings }) {
  const previewWidth = template.id === 'strata' ? 1440 : 1024
  const previewHeight = previewWidth * 820 / 1024
  const images = profile ? settings?.images : {
    portrait:portfolioDemoImages.portrait,
    projects:Object.fromEntries(getProjects(sampleProfile).entries.map((project,index) => [project.id,portfolioDemoImages.projectCovers[index % 3]])),
  }
  return <svg aria-hidden="true" viewBox={`0 0 ${previewWidth} ${previewHeight}`} className="portfolio-template-live-preview">
    <foreignObject width={previewWidth} height="6000">
      <div xmlns="http://www.w3.org/1999/xhtml" inert>
        <PortfolioPreview profile={profile || sampleProfile} settings={{...defaultPortfolio,...settings,images,template:template.id,design:{},sectionLayouts:{}}} />
      </div>
    </foreignObject>
  </svg>
}

export default function PortfolioTemplatePicker({ value, profile, settings, onChange, onClose }) {
  const ref = useRef(null)
  const opener = useRef(null)
  const [category, setCategory] = useState('All')
  const access = useTemplateAccess()
  useEffect(() => {
    const dialog = ref.current
    if (!opener.current) opener.current = document.activeElement
    const previousOverflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
      opener.current?.focus({preventScroll:true})
    }
  }, [])
  const filtered = sourcedPortfolioTemplates.filter(template => category === 'All' || template.category === category)
  const selected = getPortfolioTemplate(value)
  return <dialog ref={ref} onClose={onClose} onClick={event=>{if(event.target===ref.current)ref.current.close()}} aria-labelledby="portfolio-template-picker-title" aria-describedby="portfolio-template-picker-description" className="portfolio-template-dialog">
    <header className="portfolio-template-dialog-header">
      <div><p className="portfolio-template-kicker">MAKE IT YOURS</p><h2 id="portfolio-template-picker-title">Choose your portfolio style</h2><p id="portfolio-template-picker-description">Six ways to tell your story. Find the layout that feels like you.</p></div>
      <button type="button" autoFocus onClick={()=>ref.current.close()} className="portfolio-template-close" aria-label="Close portfolio templates"><Icon name="close" className="h-5 w-5" /></button>
    </header>
    <div className="portfolio-template-toolbar">
      <div role="group" aria-label="Filter portfolio templates" className="portfolio-template-filters">{['All',...new Set(sourcedPortfolioTemplates.map(template=>template.category))].map(item=><button key={item} type="button" aria-pressed={category===item} onClick={()=>setCategory(item)}>{item === 'All' ? 'All styles' : item}</button>)}</div>
      <p aria-live="polite">{filtered.length} {filtered.length===1?'style':'styles'}<span aria-hidden="true"> · </span><span>Current: <strong>{selected.name}</strong></span></p>
    </div>
    <div className="portfolio-template-gallery-scroll">
      <div className="portfolio-template-gallery">
        {filtered.map(template=>{
          const permission=access(template.id,'portfolio'),active=selected.id===template.id
          return <button key={template.id} type="button" className="portfolio-template-choice" aria-label={`Use ${template.name} template`} aria-pressed={active} disabled={!permission.allowed} onClick={()=>{onChange(template.id);ref.current.close()}}>
            <div className="portfolio-template-preview-wrap" style={{'--template-preview-paper':template.colors.background}}>
              <div className="portfolio-template-browser" aria-hidden="true"><span><i/><i/><i/></span><span>yourname.linkfolio</span><Icon name="window" className="h-3 w-3"/></div>
              <div className="portfolio-template-preview-crop"><TemplateThumbnail template={template} profile={profile} settings={settings}/></div>
              {active&&<span className="portfolio-template-selected"><Icon name="check" className="h-3 w-3"/>Selected</span>}
              {!permission.allowed&&<span className="portfolio-template-access">{permission.enabled?'Premium':'Unavailable'}</span>}
            </div>
            <div className="portfolio-template-choice-body">
              <span className="portfolio-template-choice-heading"><span className="portfolio-template-choice-name">{template.name}</span><span className="portfolio-template-category">{template.category}</span></span>
              <span className="portfolio-template-choice-description">{details[template.id][0]}</span>
              <span className="portfolio-template-choice-footer"><span>{details[template.id][1]}</span><span className="portfolio-template-choice-arrow" aria-hidden="true"><Icon name={active?'check':'arrow'} className="h-4 w-4"/></span></span>
            </div>
          </button>
        })}
      </div>
    </div>
    <footer className="portfolio-template-dialog-footer"><Icon name="check" className="h-4 w-4"/><p>Previews show original template styling with your content. Switching keeps your content and customizations.</p></footer>
  </dialog>
}
