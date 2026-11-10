import Icon from '../Icon'
import { portfolioCustomSections } from '../../lib/portfolioContent'
import { entryHasContent } from '../../lib/sectionContent'
import PortfolioImageDesigns from './PortfolioImageDesigns'
import { portfolioSectionDesigns } from '../../lib/portfolioSections'
import { portfolioOrder } from '../../lib/portfolioDesign'
import { getPortfolioTemplate } from '../../lib/portfolioTemplates'
import { getSummary } from '../../lib/summary'
import { getExperience } from '../../lib/experience'
import { getEducation, getSkills } from '../../lib/educationSkills'
import { getProjects, getCertifications, getLanguages } from '../../lib/additionalSections'

export default function PortfolioSectionDesigns({ settings, profile, onChange, selected, onSelect, select, range, design }) {
  const definitions = Object.fromEntries(portfolioSectionDesigns.map((section) => [section.key,section]))
  const order = portfolioOrder(getPortfolioTemplate(settings.template),settings.design)
  const removed = profile?.removedSections || []
  const custom=portfolioCustomSections(profile)
  definitions.custom={...definitions.custom,title:custom[0]?.heading || 'Custom section'}
  const source = profile ? {custom:{entries:custom.flatMap((section)=>section.entries)},
    about:getSummary(profile),projects:getProjects(profile),experience:getExperience(profile),education:getEducation(profile),skills:getSkills(profile),certifications:getCertifications(profile),languages:getLanguages(profile),
  } : {}
  const available = ['hero', ...order.filter((id) => {
    if (removed.includes(id === 'about' ? 'summary' : id)) return false
    if (id === 'contact') return Boolean(profile?.personal && ['email','phone','website','linkedin','github'].some((field) => profile.personal[field]?.trim()) || profile?.personal?.links?.some((link) => link.url?.trim()))
    return source[id]?.entries.some(entryHasContent)
  })]
  return <div className="resume-section-customization-list">{available.map(key=>{
    const definition=definitions[key]
    const savedLayout=settings.sectionLayouts?.[key]
    const layout=savedLayout==='panel'?(key==='about'?'reading':'simple'):savedLayout||'template'
    const change=value=>{onSelect(key);onChange(value)}
    return <section key={key} data-section-customization={key} data-selected={selected===key||undefined} className="resume-design-card" aria-label={`${definition.title} customization`}>
      <h2 className="resume-section-customization-title"><Icon name={key==='hero'?'user':key==='about'?'file':key} className="h-5 w-5"/><span>{settings.sectionTitles?.[key]||definition.title}</span></h2>
      <fieldset className="layout-visual-controls"><legend>Layout</legend><div className="entry-setting-choices portfolio-section-layouts">{[['template','Original'],...definition.options].map(([id,label])=><button type="button" key={id} aria-label={`${definition.title}: ${id==='template'?'Template default':label}`} aria-pressed={layout===id} onClick={()=>change({...settings,sectionLayouts:{...settings.sectionLayouts,[key]:id}})}>{label}</button>)}</div></fieldset>
      {key!=='hero'&&<details className="portfolio-section-heading-edit"><summary>Edit heading</summary><label className="block text-sm font-medium">Section heading<input aria-label={`${definition.title} heading`} value={settings.sectionTitles?.[key]??definition.title} maxLength={80} onChange={event=>change({...settings,sectionTitles:{...settings.sectionTitles,[key]:event.target.value}})} className="mt-2 min-h-11 w-full rounded-lg border border-line px-3 font-normal"/></label></details>}
      {key==='projects'&&<details className="design-fine-group"><summary>Project cards</summary><div className="space-y-4 pt-4">{select('projectColumns','Project columns',{template:'Original',1:'One column',2:'Two columns',3:'Three columns'})}{range('projectGap','Project spacing',8,48)}</div></details>}
      {['hero','projects'].includes(key)&&<PortfolioImageDesigns section={key} settings={settings} profile={profile} design={design} select={select} range={range} onChange={change}/>}
    </section>
  })}</div>
}
