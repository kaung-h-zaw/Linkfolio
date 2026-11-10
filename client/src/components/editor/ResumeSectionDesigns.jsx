import Icon from '../Icon'
import ResumeCollectionControls from './ResumeCollectionControls'
import { resumeDesignSections } from '../../lib/resumeDesignSections'
import { isExtraSection, isCustomSection } from '../../lib/contentCatalog'

export default function ResumeSectionDesigns({ profile, design, onChange, selected, onSelect }) {
  const styles=design.sectionStyles||{}
  const sections=resumeDesignSections(profile,design).filter(section=>['experience','education','projects','skills','languages','certifications'].includes(section.key)||isExtraSection(section.key))
  return <div className="resume-section-customization-list">{sections.map(section=>{
    const value=styles[section.key]||{}
    const customSkills=isCustomSection(section.key)&&profile.extraContent?.find(item=>item.type===section.key)?.format==='skills'
    const collection=['skills','languages','certifications'].includes(section.key)||customSkills
    const change=next=>{onSelect(section.key);onChange({...design,sectionStyles:{...styles,[section.key]:next}})}
    return <section key={section.key} data-section-customization={section.key} data-selected={selected===section.key||undefined} aria-label={`${section.title} customization`} className="resume-design-card resume-section-customization-card">
      <h2 className="resume-section-customization-title"><Icon name={isCustomSection(section.key)?'custom':section.key} className="h-5 w-5"/><span>{section.title}</span></h2>
        {['experience','education'].includes(section.key) && <fieldset className="layout-visual-controls"><legend>Title and subtitle order</legend><div className="entry-setting-choices">{(section.key==='experience' ? [['title-subtitle','Job title – Employer'],['subtitle-title','Employer – Job title']] : [['title-subtitle','Degree – School'],['subtitle-title','School – Degree']]).map(([key,label])=><button type="button" key={key} aria-label={`Title order: ${label}`} aria-pressed={(value.titleOrder||'title-subtitle')===key} onClick={()=>change({...value,titleOrder:key})}>{label}</button>)}</div></fieldset>}
        {collection && <>
          <fieldset className="layout-visual-controls"><legend>Display style</legend><div className="entry-setting-choices section-content-style-choices">{[['columns','Grid'],['list','Rows'],['compact','Compact'],['tags','Bubble']].map(([key,label])=><button type="button" key={key} aria-label={`${section.title} style: ${label}`} aria-pressed={(value.contentLayout||(section.key==='certifications'?'list':'columns'))===key} onClick={()=>change({...value,contentLayout:key})}>{label}</button>)}</div></fieldset>
          <ResumeCollectionControls section={section} value={value} change={change} profile={profile}/>
        </>}
        {(['experience','education','projects'].includes(section.key)||isCustomSection(section.key)&&profile.extraContent?.find(item=>item.type===section.key)?.format!=='skills'||section.key==='certifications'&&!value.contentLayout) && <fieldset><legend className="mb-2 text-sm font-medium">Entry layout</legend><div className="entry-setting-choices">{[['general','Use general layout'],['full','Dates below'],['columns','Dates on the right']].map(([id,label]) => <button type="button" key={id} aria-label={`Section layout: ${label}`} aria-pressed={(value.entryLayout || 'general') === id} onClick={() => { const next = { ...value }; if (id === 'general') delete next.entryLayout; else next.entryLayout = id; change(next) }}><span>{label}</span></button>)}</div></fieldset>}
        {isExtraSection(section.key) && !customSkills && <fieldset>
          <legend className="mb-2 text-sm font-medium">Content layout</legend>
          <div className="entry-setting-choices">{[['list','List','Place each entry below the previous one.'],['columns','Two columns','Arrange entries in two equal columns.']].map(([id,label,description]) => <button type="button" key={id} aria-label={`Custom section layout: ${label}`} aria-pressed={(value.contentLayout || 'list') === id} onClick={() => change({...value,contentLayout:id})}>
            <span className="layout-choice-heading"><span>{label}</span>{(value.contentLayout || 'list') === id && <span className="layout-choice-selected">Selected</span>}</span>
          </button>)}</div>
        </fieldset>}

    </section>
  })}{!sections.length && <p className="text-sm text-muted">Add content to customize sections.</p>}</div>
}
