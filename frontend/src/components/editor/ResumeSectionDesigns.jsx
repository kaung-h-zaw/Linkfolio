import Icon from '../Icon'
import ResumeCollectionControls from './ResumeCollectionControls'
import { resumeDesignSections } from '../../lib/resumeDesignSections'
import { isExtraSection, isCustomSection } from '../../lib/contentCatalog'
import { collectionLayout, usesStackedGridEntries } from '../../lib/resumeSectionLayouts'

const collectionLayouts = [['columns', 'Grid'], ['list', 'Rows'], ['compact', 'Compact'], ['tags', 'Bubble']]
const certificationLayouts = [['entries', 'Entries'], ...collectionLayouts]
const entryLayouts = [['general', 'Use general layout'], ['full', 'Dates below'], ['columns', 'Dates on the right']]

export default function ResumeSectionDesigns({ profile, design, onChange, selected, onSelect }) {
  const styles=design.sectionStyles||{}
  const sections=resumeDesignSections(profile,design).filter(section=>['experience','education','projects','skills','languages','certifications'].includes(section.key)||isExtraSection(section.key))
  return <div className="resume-section-customization-list">{sections.map(section=>{
    const value=styles[section.key]||{}
    const customSkills=isCustomSection(section.key)&&profile.extraContent?.find(item=>item.type===section.key)?.format==='skills'
    const collection=['skills','languages','certifications'].includes(section.key)||customSkills
    const supportsEntryLayout = ['experience', 'education', 'projects'].includes(section.key) ||
      (isCustomSection(section.key) && !customSkills && !usesStackedGridEntries(section.key, value)) ||
      (section.key === 'certifications' && !value.contentLayout)
    const displayStyle = collectionLayout(section.key, value) ?? 'entries'
    const displayChoices = section.key === 'certifications' ? certificationLayouts : collectionLayouts
    const change=next=>{onSelect(section.key);onChange({...design,sectionStyles:{...styles,[section.key]:next}})}
    const changeDisplayStyle = (mode) => {
      const next = { ...value }
      if (mode === 'entries') delete next.contentLayout
      else next.contentLayout = mode
      change(next)
    }
    return <section key={section.key} data-section-customization={section.key} data-selected={selected===section.key||undefined} aria-label={`${section.title} customization`} className="resume-design-card resume-section-customization-card">
      <h2 className="resume-section-customization-title"><Icon name={isCustomSection(section.key)?'custom':section.key} className="h-5 w-5"/><span>{section.title}</span></h2>
        {['experience','education'].includes(section.key) && <fieldset className="layout-visual-controls"><legend>Title and subtitle order</legend><div className="entry-setting-choices">{(section.key==='experience' ? [['title-subtitle','Job title – Employer'],['subtitle-title','Employer – Job title']] : [['title-subtitle','Degree – School'],['subtitle-title','School – Degree']]).map(([key,label])=><button type="button" key={key} aria-label={`Title order: ${label}`} aria-pressed={(value.titleOrder||'title-subtitle')===key} onClick={()=>change({...value,titleOrder:key})}>{label}</button>)}</div></fieldset>}
        {collection && <>
          <fieldset className="layout-visual-controls"><legend>Display style</legend><div className="entry-setting-choices section-content-style-choices">{displayChoices.map(([key,label])=><button type="button" key={key} aria-label={`${section.title} style: ${label}`} aria-pressed={displayStyle===key} onClick={()=>changeDisplayStyle(key)}>{label}</button>)}</div></fieldset>
          <ResumeCollectionControls section={section} value={value} change={change}/>
        </>}
        {supportsEntryLayout && <fieldset><legend className="mb-2 text-sm font-medium">Entry layout</legend><div className="entry-setting-choices">{entryLayouts.map(([id,label]) => <button type="button" key={id} aria-label={`Section layout: ${label}`} aria-pressed={(value.entryLayout || 'general') === id} onClick={() => { const next = { ...value }; if (id === 'general') delete next.entryLayout; else next.entryLayout = id; change(next) }}><span>{label}</span></button>)}</div></fieldset>}
        {isExtraSection(section.key) && !customSkills && <fieldset>
          <legend className="mb-2 text-sm font-medium">Content layout</legend>
          <div className="entry-setting-choices">{[['list','List'],['columns','Two columns']].map(([id,label]) => <button type="button" key={id} aria-label={`Custom section layout: ${label}`} aria-pressed={(value.contentLayout || 'list') === id} onClick={() => change({...value,contentLayout:id})}>
            <span className="layout-choice-heading"><span>{label}</span>{(value.contentLayout || 'list') === id && <span className="layout-choice-selected">Selected</span>}</span>
          </button>)}</div>
        </fieldset>}

    </section>
  })}{!sections.length && <p className="text-sm text-muted">Add content to customize sections.</p>}</div>
}
