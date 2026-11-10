import PortfolioSections from './PortfolioSections'
import PortfolioEntryDetailsEditor from './PortfolioEntryDetailsEditor'
import { portfolioCustomSections } from '../../lib/portfolioContent'
import { getPortfolioTemplate } from '../../lib/portfolioTemplates'
import PortfolioDesignControls from './PortfolioDesignControls'
import PortfolioImages from './PortfolioImages'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import PortfolioResumeAttachment from './PortfolioResumeAttachment'
import PortfolioTemplatePicker from './PortfolioTemplatePicker'
import { getSummary, summaryText } from '../../lib/summary'
import { getExperience } from '../../lib/experience'
import { getEducation, getSkills } from '../../lib/educationSkills'
import { getProjects, getCertifications, getLanguages, visibleEntries } from '../../lib/additionalSections'
import { defaultPortfolio } from '../../lib/portfolio'
const availabilityOptions = [
  '',
  'Open to work',
  'Open to job opportunities',
  'Available for freelance',
  'Open to collaborations',
  'Not currently available',
]
export default function PortfolioPanel({
  settings,
  styleHistory, customizationTab, onCustomizationTabChange, selectedSection, onSelectSection,
  onChange,
  mode = 'content',
  projects = [],
  personal = {},
  profile,
  resumes = [],
  onUseResume,
  onEditResume,
  linkedResume,
}) {
  const sourceResume = settings.sourceResume || linkedResume
  const currentResume = resumes.find((resume) => resume.id === sourceResume?.id)
  const counts = profile ? { about:getSummary(profile).entries.filter((e) => e.visible && summaryText(e.content).trim()).length, projects:visibleEntries(getProjects(profile),['name']).length,experience:visibleEntries(getExperience(profile),['jobTitle','company']).length,education:visibleEntries(getEducation(profile),['degree','school']).length,skills:visibleEntries(getSkills(profile),['name']).length,certifications:visibleEntries(getCertifications(profile),['name']).length,languages:visibleEntries(getLanguages(profile),['name']).length,contact:personal.email || personal.website || personal.phone ? 1 : 0 } : {}
  for (const key of profile?.removedSections || []) counts[key === 'summary' ? 'about' : key] = 0
  counts.custom=portfolioCustomSections(profile).reduce((total,section)=>total+section.entries.length,0)
  const customTitle=portfolioCustomSections(profile)[0]?.heading || 'Custom section'
  const [customAvailability, setCustomAvailability] = useState(
    () => !availabilityOptions.includes(settings.availability),
  )
  const set = (key, value) => onChange({ ...settings, [key]: value })
  return (
    <>
      <div className="sr-only">
        <h1 className="mt-2 text-2xl font-semibold">
          {mode === 'design' ? 'Portfolio design' : 'Portfolio content'}
        </h1>
      </div>
    <div className="editor-panel-body mx-auto max-w-2xl space-y-5 px-4 py-7 lg:px-8">
      {mode === 'design' && <>
        <PortfolioDesignControls templatePicker={<details className="resume-design-card portfolio-template-card" data-design-group="templates">
          <summary className="design-template-row cursor-pointer"><span><span className="block text-sm font-semibold">Templates</span><strong className="mt-1 block text-sm">{getPortfolioTemplate(settings.template).name}</strong></span><span className="rounded-md border border-line px-3 py-2 text-sm font-medium">Choose portfolio template</span></summary>
          <div className="mt-5"><PortfolioTemplatePicker profile={profile} settings={settings} value={settings.template || defaultPortfolio.template} surface={settings.surface} color={settings.color} onChange={(value) => set('template',value)} /></div>
        </details>} customizationTab={customizationTab} onCustomizationTabChange={onCustomizationTabChange} selectedSection={selectedSection} onSelectSection={onSelectSection} styleHistory={styleHistory} profile={profile} settings={settings} onChange={onChange} />
      </>}
      {mode === 'content' && (
        <>
          <section className="space-y-3 rounded-md border border-line bg-white p-5">
            <label htmlFor="portfolio-resume-source" className="block text-sm font-medium">Resume</label>
            <div className="portfolio-resume-row">
              <select id="portfolio-resume-source" value={sourceResume?.id || ''} disabled={!resumes.length} onChange={(event) => onUseResume(event.target.value)} className="min-h-11 w-full min-w-0 rounded border border-line bg-white px-3 text-sm">
                {!sourceResume && <option value="" disabled>Choose a resume</option>}
                {sourceResume && !currentResume && <option value={sourceResume.id} disabled>{sourceResume.name} (unavailable)</option>}
                {resumes.map((resume) => <option key={resume.id} value={resume.id}>{resume.name}</option>)}
              </select>
              <button type="button" disabled={!currentResume} onClick={() => onEditResume(currentResume.id)} className="button button-outline disabled:opacity-40">Edit resume</button>
            </div>
            {!resumes.length && <Link to="/setup" className="button button-outline">Create a resume</Link>}
          </section>
          <PortfolioSections settings={settings} onChange={onChange} sections={['about','projects','experience','education','skills','certifications','languages','custom','contact'].filter((key)=>counts[key]>0).map((key)=>({key,title:key==='custom' ? customTitle : key[0].toUpperCase()+key.slice(1)}))} />
          <section className="space-y-5 rounded-md border border-line bg-white p-5">
            <h2 className="font-semibold">Availability</h2>
            <label className="block text-sm font-medium">
              Availability
              <select
                aria-label="Availability"
                value={customAvailability ? 'custom' : settings.availability}
                onChange={(event) => {
                  const custom = event.target.value === 'custom'
                  setCustomAvailability(custom)
                  set('availability', custom ? '' : event.target.value)
                }}
                className="mt-2 min-h-11 w-full border border-line bg-white px-3 text-sm"
              >
                {availabilityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option || 'Do not show availability'}
                  </option>
                ))}
                <option value="custom">Custom message…</option>
              </select>
            </label>
            {customAvailability && (
              <label className="block text-sm font-medium">
                Custom availability message
                <input
                  value={settings.availability}
                  maxLength={160}
                  onChange={(event) => set('availability', event.target.value)}
                  placeholder="e.g. Available for projects from November"
                  className="mt-2 min-h-11 w-full border border-line px-3 text-sm"
                />
              </label>
            )}

          </section>
          <PortfolioImages settings={settings} onChange={onChange} projects={projects} personal={personal} />
          <PortfolioEntryDetailsEditor profile={profile} settings={settings} onChange={onChange} />
          <PortfolioResumeAttachment settings={settings} onChange={onChange} />
        </>
      )}


    </div>
    </>
  )
}
