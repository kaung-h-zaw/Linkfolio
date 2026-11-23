import { useId, useRef, useState } from 'react'
import Icon from '../Icon'
import PortfolioLayoutChoice from './PortfolioLayoutChoice'
import { portfolioExtraSections } from '../../lib/portfolioContent'
import { isCustomSection, isExtraSection } from '../../lib/contentCatalog'
import { entryHasContent } from '../../lib/sectionContent'
import PortfolioImageDesigns from './PortfolioImageDesigns'
import { portfolioSectionDesigns } from '../../lib/portfolioSections'
import { portfolioOrder } from '../../lib/portfolioDesign'
import { getPortfolioTemplate } from '../../lib/portfolioTemplates'
import { getSummary } from '../../lib/summary'
import { getExperience } from '../../lib/experience'
import { getEducation, getSkills } from '../../lib/educationSkills'
import { getProjects, getCertifications, getLanguages } from '../../lib/additionalSections'

const sectionIcons = { hero: 'user', about: 'file', contact: 'mail' }

function SectionHeading({ sectionKey, title, value, onChange }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [error, setError] = useState(false)
  const editButton = useRef(null)
  const input = useRef(null)
  const errorId = useId()
  function save() {
    if (!draft.trim()) {
      setError(true)
      input.current?.focus()
      return
    }
    onChange(draft.trim())
    setEditing(false)
    setError(false)
    editButton.current?.focus()
  }
  return <div className="portfolio-section-heading-editor">
    <div className="portfolio-section-heading-row">
      <h2 className="resume-section-customization-title">
        <Icon name={sectionIcons[sectionKey] || (isCustomSection(sectionKey) ? 'custom' : sectionKey)} className="h-5 w-5" />
        {editing ? <input
          ref={input}
          autoFocus
          aria-label={`${title} heading`}
          aria-invalid={error || undefined}
          aria-describedby={error ? errorId : undefined}
          value={draft}
          maxLength={80}
          onChange={event => {
            setDraft(event.target.value)
            setError(!event.target.value.trim())
          }}
          onFocus={event => event.target.select()}
          onKeyDown={event => {
            if (event.key === 'Enter') {
              event.preventDefault()
              save()
            } else if (event.key === 'Escape') {
              event.preventDefault()
              setEditing(false)
              setError(false)
              editButton.current?.focus()
            }
          }}
          className="portfolio-section-heading-input"
        /> : <span>{value || title}</span>}
      </h2>
      {sectionKey !== 'hero' && <button
        ref={editButton}
        type="button"
        className="entry-heading-edit portfolio-heading-action"
        aria-label={`${editing ? 'Save' : 'Edit'} ${title} heading`}
        title={editing ? 'Save heading' : 'Edit heading'}
        aria-expanded={editing}
        onClick={() => {
          if (editing) save()
          else {
            setDraft(value)
            setError(false)
            setEditing(true)
          }
        }}
      ><Icon name={editing ? 'save' : 'edit'} className="h-4 w-4" /><span>{editing ? 'Save' : 'Edit'}</span></button>}
    </div>
    {editing && error && <p id={errorId} role="alert" className="portfolio-heading-error">Please add a section heading before saving.</p>}
  </div>
}

export default function PortfolioSectionDesigns({ settings, profile, onChange, selected, onSelect, select, range, design }) {
  const definitions = Object.fromEntries(portfolioSectionDesigns.map((section) => [section.key,section]))
  const extraSections = portfolioExtraSections(profile)
  const order = portfolioOrder(getPortfolioTemplate(settings.template),settings.design,extraSections.map(section=>section.type))
  const removed = profile?.removedSections || []
  for (const section of extraSections) definitions[section.type] = {...definitions[section.format === 'skills' ? 'skills' : 'experience'],key:section.type,title:section.heading || 'Custom section'}
  const source = profile ? {
    ...Object.fromEntries(extraSections.map(section=>[section.type,section])),
    about:getSummary(profile),projects:getProjects(profile),experience:getExperience(profile),education:getEducation(profile),skills:getSkills(profile),certifications:getCertifications(profile),languages:getLanguages(profile),
  } : {}
  const available = ['hero', ...order.filter((id) => {
    if (isExtraSection(id)) return Boolean(source[id])
    if (removed.includes(id === 'about' ? 'summary' : id)) return false
    if (id === 'contact') return Boolean(profile?.personal && ['email','phone','website','linkedin','github'].some((field) => profile.personal[field]?.trim()) || profile?.personal?.links?.some((link) => link.url?.trim()))
    return source[id]?.entries.some(entryHasContent)
  })]
  return <div className="resume-section-customization-list">
    {available.map(key=>{
    const definition=definitions[key]
    const extra=isExtraSection(key)
    const visible=extra ? settings.extraSectionVisibility?.[key] ?? settings.custom !== false : settings[key] !== false
    const savedLayout=settings.sectionLayouts?.[key] ?? (extra && !extraSections.some(section=>section.type==='custom') ? settings.sectionLayouts?.custom : undefined)
    const layout=key==='hero' && savedLayout==='left'?'portrait-left':key==='contact' && savedLayout==='centered'?'form-first':savedLayout==='panel'?(key==='about'?'reading':'simple'):savedLayout||'template'
    const change=value=>{onSelect(key);onChange(value)}
    return <section key={key} data-section-customization={key} data-selected={selected===key||undefined} className="resume-design-card resume-section-customization-card" aria-label={`${definition.title} customization`}>
      <SectionHeading sectionKey={key} title={definition.title} value={settings.sectionTitles?.[key]??definition.title} onChange={value=>change({...settings,sectionTitles:{...settings.sectionTitles,[key]:value}})} />
      {key==='contact' && <p className="text-sm text-muted">Contact always stays in the portfolio footer.</p>}
      {extra && <label className="resume-simple-toggle"><input type="checkbox" aria-label={`Show ${definition.title} section`} checked={visible} onChange={event=>change({...settings,extraSectionVisibility:{...settings.extraSectionVisibility,[key]:event.target.checked}})} /><span>Show in this portfolio</span></label>}
      {extra && !visible && <p className="text-sm text-muted">Hidden from this portfolio.</p>}
      {extra && !source[key]?.entries.length && <p className="text-sm text-muted">Add visible entries in your resume to show this section.</p>}
      <fieldset className="layout-visual-controls"><legend>Layout</legend><div className="entry-setting-choices portfolio-section-layouts">{[['template','Original'],...definition.options].map(([id,label])=><PortfolioLayoutChoice key={id} sectionKey={key} previewLayout={key==='contact' && id==='template' ? (getPortfolioTemplate(settings.template).layouts.contact === 'centered' ? 'form-first' : getPortfolioTemplate(settings.template).layouts.contact || 'split') : undefined} sectionTitle={definition.title} layout={id} label={label} selected={layout===id} onSelect={()=>change({...settings,sectionLayouts:{...settings.sectionLayouts,[key]:id}})} />)}</div></fieldset>
      {key==='projects'&&<details className="design-fine-group"><summary>Project cards</summary><div className="space-y-4 pt-4">{select('projectColumns','Project columns',{template:'Original',1:'One column',2:'Two columns',3:'Three columns'})}{range('projectGap','Project spacing',8,48)}</div></details>}
      {key==='hero'&&<PortfolioImageDesigns section={key} settings={settings} profile={profile} design={design} select={select} range={range} onChange={change}/>}
    </section>
  })}</div>
}
