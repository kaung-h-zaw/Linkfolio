import Select from "../Select"
import Icon from '../Icon'
import PortfolioSections from './PortfolioSections'
import PortfolioEntryDetailsEditor from './PortfolioEntryDetailsEditor'
import { portfolioExtraSections } from '../../lib/portfolioContent'
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
import PortfolioPreview from '../PortfolioPreview'
import { sourcedPortfolioTemplates } from '../../lib/portfolioTemplates'
import { portfolioDemoImages } from '../../lib/portfolioImages'
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
  personal = {},
  profile,
  resumes = [],
  onUseResume,
  onEditResume,
  linkedResume,
}) {
  const currentTemplate = getPortfolioTemplate(settings.template)
  const sourceResume = settings.sourceResume || linkedResume
  const currentResume = resumes.find((resume) => resume.id === sourceResume?.id)
  const counts = profile ? { about:getSummary(profile).entries.filter((e) => e.visible && summaryText(e.content).trim()).length, projects:visibleEntries(getProjects(profile),['name']).length,experience:visibleEntries(getExperience(profile),['jobTitle','company']).length,education:visibleEntries(getEducation(profile),['degree','school']).length,skills:visibleEntries(getSkills(profile),['name']).length,certifications:visibleEntries(getCertifications(profile),['name']).length,languages:visibleEntries(getLanguages(profile),['name']).length,contact:personal.email || personal.website || personal.phone ? 1 : 0 } : {}
  for (const key of profile?.removedSections || []) counts[key === 'summary' ? 'about' : key] = 0
  const extraSections=portfolioExtraSections(profile)
  const sections=[
    ...['about','projects','experience','education','skills','certifications','languages','contact'].filter(key=>counts[key]>0).map(key=>({key,title:settings.sectionTitles?.[key] || key[0].toUpperCase()+key.slice(1)})),
    ...extraSections.map(section=>({key:section.type,title:settings.sectionTitles?.[section.type] || section.heading || 'Custom section',extra:true})),
  ]
  const [customAvailability, setCustomAvailability] = useState(
    () => !availabilityOptions.includes(settings.availability),
  )
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false)
  const templatePreviews = [currentTemplate, ...sourcedPortfolioTemplates.filter((template) => template.id !== currentTemplate.id)].slice(0, 3)
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
        <PortfolioDesignControls templatePicker={<section data-design-group="templates" className="resume-design-card design-template-row resume-template-card portfolio-template-card" aria-labelledby="portfolio-templates-title">
          <div className="resume-design-card-heading"><h2 id="portfolio-templates-title">Templates</h2></div>
          <div className="resume-template-montage portfolio-template-montage" aria-hidden="true" inert>{templatePreviews.map((template) => <div key={template.id} className="template-thumbnail"><div className="portfolio-template-miniature"><PortfolioPreview profile={profile} settings={{...defaultPortfolio,...settings,images:settings.images || portfolioDemoImages,template:template.id}} /></div></div>)}</div>
          <div className="resume-template-card-footer">
            <span className="resume-template-current"><Icon name="check" className="h-4 w-4" /><span>{currentTemplate.name}</span></span>
            <button type="button" onClick={() => setTemplatePickerOpen(true)} className="resume-template-browse"><Icon name="grid" className="h-4 w-4" /><span>Browse templates</span></button>
          </div>
        </section>} customizationTab={customizationTab} onCustomizationTabChange={onCustomizationTabChange} selectedSection={selectedSection} onSelectSection={onSelectSection} styleHistory={styleHistory} profile={profile} settings={settings} onChange={onChange} />
        {templatePickerOpen && <PortfolioTemplatePicker profile={profile} settings={settings} value={settings.template || defaultPortfolio.template} surface={settings.surface} color={settings.color} onChange={(value) => set('template',value)} onClose={() => setTemplatePickerOpen(false)} />}
      </>}
      {mode === 'content' && (
        <>
          <section className="space-y-3 rounded-md border border-line bg-white p-5">
            <label htmlFor="portfolio-resume-source" className="block text-sm font-medium">Resume</label>
            <div className="portfolio-resume-row">
              <Select id="portfolio-resume-source" value={sourceResume?.id || ''} disabled={!resumes.length} onChange={(event) => onUseResume(event.target.value)} className="min-h-11 w-full min-w-0 rounded border border-line bg-white px-3 text-sm">
                {!sourceResume && <option value="" disabled>Choose a resume</option>}
                {sourceResume && !currentResume && <option value={sourceResume.id} disabled>{sourceResume.name} (unavailable)</option>}
                {resumes.map((resume) => <option key={resume.id} value={resume.id}>{resume.name}</option>)}
              </Select>
              <button type="button" disabled={!currentResume} onClick={() => onEditResume(currentResume.id)} className="button button-outline disabled:opacity-40">Edit resume</button>
            </div>
            {!resumes.length && <Link to="/setup" className="button button-outline">Create a resume</Link>}
          </section>
          <PortfolioSections settings={settings} onChange={onChange} sections={sections} />
          <section className="space-y-5 rounded-md border border-line bg-white p-5">
            <h2 className="font-semibold">Availability</h2>
            <label className="block text-sm font-medium">
              Availability
              <Select
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
              </Select>
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
          <PortfolioImages settings={settings} onChange={onChange} personal={personal} />
          <PortfolioEntryDetailsEditor profile={profile} settings={settings} onChange={onChange} />
          <PortfolioResumeAttachment settings={settings} onChange={onChange} />
        </>
      )}


    </div>
    </>
  )
}
