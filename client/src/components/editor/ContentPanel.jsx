import Icon from '../Icon'
import CustomSectionSettings from './CustomSectionSettings'
import { experienceDate, newExperience } from '../../lib/experience'
import AddContentDialog from './AddContentDialog'
import {
  coreSections,
  isCustomSection,
  extraSections,
  newContentEntry,
} from '../../lib/contentCatalog'
import { summaryText, textDocument } from '../../lib/summary'
import {
  newProject,
  newCertification,
  newLanguage,
} from '../../lib/additionalSections'
import PersonalDetails from './PersonalDetails'
import SummarySection from './SummarySection'
import ExperienceSection from './ExperienceSection'
import { lazy, useEffect, useState } from 'react'
import EntrySection from './EntrySection'
import { newEducation, newSkill } from '../../lib/educationSkills'
const ExtraContentEditor = lazy(() => import('./ExtraContentEditor'))
const CustomEntryEditor = lazy(() => import('./CustomEntryEditor'))
const CustomSkillsEditor = lazy(() => import('./ExtraContentEditor').then((module) => ({default:module.CustomSkillsEditor})))
const EducationEditor = lazy(() => import('./EducationEditor'))
const SkillsEditor = lazy(() => import('./SkillsEditor'))
const ProjectEditor = lazy(() => import('./ProjectEditor'))
const CertificationEditor = lazy(() => import('./CertificationEditor'))
const LanguageEditor = lazy(() => import('./LanguageEditor'))

export default function ContentPanel({
  mode = 'resume',
  personalEditRequest = 0,
  removedSections,
  onRemovedSectionsChange,
  extraContent,
  onExtraContentChange,
  personal,
  onPersonalChange,
  summary,
  onSummaryChange,
  experience,
  onExperienceChange,
  education,
  onEducationChange,
  skills,
  onSkillsChange,
  projects,
  onProjectsChange,
  certifications,
  onCertificationsChange,
  languages,
  onLanguagesChange,
}) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [addedNotice, setAddedNotice] = useState('')
  const [removedNotice, setRemovedNotice] = useState(null)
  const [entryRequest,setEntryRequest] = useState(null)
  function removeSection(type) {
    onRemovedSectionsChange([...removedSections, type])
    setRemovedNotice(type)
    setActive(null)
  }
  function addSection(type, customHeading, options = {}, startEditing = true) {
    const core={summary:[summary,onSummaryChange,()=>({id:crypto.randomUUID(),visible:true,content:textDocument()})],experience:[experience,onExperienceChange,newExperience],education:[education,onEducationChange,newEducation],skills:[skills,onSkillsChange,newSkill],projects:[projects,onProjectsChange,newProject],certifications:[certifications,onCertificationsChange,newCertification],languages:[languages,onLanguagesChange,newLanguage]}
    // A named custom section is always a new section; restoring uses its existing key.
    if(type==='custom' && customHeading && extraContent.some(section=>section.type==='custom'))type=`custom_${crypto.randomUUID()}`
    const existing=extraContent.find(section=>section.type===type)
    if(removedSections.includes(type))onRemovedSectionsChange(removedSections.filter(key=>key!==type))
    if(core[type]) {
      const [section,update,create]=core[type]
      if(startEditing){
        const entry=section.entries[0]||create()
        if(!section.entries.length)update({...section,entries:[entry]})
        setEntryRequest({type,id:entry.id})
        setActive(type)
      }
    } else {
      const definition=extraSections.find(([key])=>key===(isCustomSection(type)?'custom':type))
      if(!definition)return
      const entry=existing?.entries[0]||(startEditing?newContentEntry():null)
      if(!existing)onExtraContentChange([...extraContent,{type,heading:customHeading||definition[1],entries:entry?[entry]:[],...options}])
      else if(startEditing&&!existing.entries.length)onExtraContentChange(extraContent.map(section=>section.type===type?{...section,entries:[entry]}:section))
      if(startEditing&&entry){setEntryRequest({type,id:entry.id});setActive(type)}
    }
    setPickerOpen(false)
    setAddedNotice('')
    setRemovedNotice(null)
  }
  const [active, setActive] = useState(null)
  useEffect(() => {
    if (!personalEditRequest) return
    setActive('personal')
    const frame = requestAnimationFrame(() => requestAnimationFrame(() => {
      document.getElementById('editor-content')?.scrollTo({ top:0, behavior:'instant' })
      document.querySelector('#editor-content .personal-edit-form input')?.focus({ preventScroll:true })
    }))
    return () => cancelAnimationFrame(frame)
  }, [personalEditRequest])
  const visible = (key) =>
    !removedSections.includes(key) && (!active || active === key)
  const editing = (key) => (value) => {if(!value)setEntryRequest(null);setActive(value ? key : null)}
  return (
    <>
      <div hidden={Boolean(active)} className="sr-only">
        <h1 tabIndex={-1} className="text-2xl font-semibold tracking-tight">
          {mode === 'portfolio' ? 'Profile and projects' : 'Resume content'}
        </h1>
      </div>
    <div className="editor-panel-body relative mx-auto w-full max-w-2xl px-4 py-7 lg:px-8 lg:py-9">
      <div hidden={!visible('personal')}>
        <PersonalDetails
          personal={personal}
          onChange={onPersonalChange}
          editing={active === 'personal'}
          onEditingChange={editing('personal')}
        />
      </div>
      <div
        hidden={Boolean(active)}
        className="mt-7 mb-3 flex items-center justify-between text-xs text-muted"
      >
        <span>Resume sections</span>
        <span>{[...coreSections.filter(([key])=>key!=='personal').map(([key])=>key),...extraContent.map(section=>section.type)].filter(key=>!removedSections.includes(key)).length} sections</span>
      </div>
      <div className={active ? 'space-y-2.5' : 'content-section-list'}>
        <div hidden={!visible('summary')}>
          <SummarySection
            editEntryId={entryRequest?.type==='summary'?entryRequest.id:undefined}
            onRemove={() => removeSection('summary')}
            summary={summary}
            onChange={onSummaryChange}
            onEditingChange={editing('summary')}
          />
        </div>
        <div hidden={!visible('experience')}>
          <ExperienceSection
            editEntryId={entryRequest?.type==='experience'?entryRequest.id:undefined}
            onRemove={() => removeSection('experience')}
            experience={experience}
            onChange={onExperienceChange}
            onEditingChange={editing('experience')}
          />
        </div>
        <div hidden={!visible('education')}>
          <EntrySection
            editEntryId={entryRequest?.type==='education'?entryRequest.id:undefined}
            section={education}
            onRemove={() => removeSection('education')}
            onChange={onEducationChange}
            onEditingChange={editing('education')}
            EntryEditor={EducationEditor}
            createEntry={newEducation}
            entryLabel={(entry) => entry.degree || 'Add your degree…'}
            entryDescription={(entry) =>
              [
                entry.school,
                [
                  experienceDate(entry.startDate),
                  entry.current ? 'Present' : experienceDate(entry.endDate),
                ]
                  .filter(Boolean)
                  .join(' — '),
              ]
                .filter(Boolean)
                .join(' · ')
            }
            kind="education"
            icon="education"
          />
        </div>
        <div hidden={!visible('skills')}>
          <EntrySection
            editEntryId={entryRequest?.type==='skills'?entryRequest.id:undefined}
            section={skills}
            onRemove={() => removeSection('skills')}
            onChange={onSkillsChange}
            onEditingChange={editing('skills')}
            EntryEditor={SkillsEditor}
            createEntry={newSkill}
            entryLabel={(entry) => entry.name || 'Add a skill or category…'}
            kind="skill"
            icon="skills"
          />
        </div>
        <div hidden={!visible('projects')}>
          <EntrySection
            editEntryId={entryRequest?.type==='projects'?entryRequest.id:undefined}
            section={projects}
            onRemove={() => removeSection('projects')}
            onChange={onProjectsChange}
            onEditingChange={editing('projects')}
            EntryEditor={ProjectEditor}
            createEntry={newProject}
            entryLabel={(entry) => entry.name || 'Add a project…'}
            entryDescription={(entry) => entry.subtitle}
            kind="project"
            icon="folder"
          />
        </div>
        <div hidden={!visible('certifications')}>
          <EntrySection
            editEntryId={entryRequest?.type==='certifications'?entryRequest.id:undefined}
            section={certifications}
            onRemove={() => removeSection('certifications')}
            onChange={onCertificationsChange}
            onEditingChange={editing('certifications')}
            EntryEditor={CertificationEditor}
            createEntry={newCertification}
            entryLabel={(entry) => entry.name || 'Add a certification…'}
            entryDescription={(entry) => entry.issuer}
            kind="certification"
            icon="certifications"
          />
        </div>
        <div hidden={!visible('languages')}>
          <EntrySection
            editEntryId={entryRequest?.type==='languages'?entryRequest.id:undefined}
            section={languages}
            onRemove={() => removeSection('languages')}
            onChange={onLanguagesChange}
            onEditingChange={editing('languages')}
            EntryEditor={LanguageEditor}
            createEntry={newLanguage}
            entryLabel={(entry) =>
              [entry.name, entry.level].filter(Boolean).join(' · ') ||
              'Add a language…'
            }
            kind="language"
            icon="languages"
          />
        </div>
        {extraContent.map((section) => (
          <div key={section.type} hidden={!visible(section.type)}>
            <EntrySection
              editEntryId={entryRequest?.type===section.type?entryRequest.id:undefined}
              section={section}
              defaultOpen={section.entries.length === 0}
              controls={isCustomSection(section.type) ? <CustomSectionSettings section={section} onChange={(value)=>onExtraContentChange(extraContent.map((item)=>item.type===section.type ? value : item))} /> : undefined}
              onRemove={() => removeSection(section.type)}
              onChange={(value) =>
                onExtraContentChange(
                  extraContent.map((item) =>
                    item.type === section.type ? value : item,
                  ),
                )
              }
              onEditingChange={editing(section.type)}
              EntryEditor={isCustomSection(section.type) ? section.format === 'skills' ? CustomSkillsEditor : CustomEntryEditor : ExtraContentEditor}
              createEntry={newContentEntry}
              entryLabel={(entry) =>
                entry.name || summaryText(entry.content) || 'Add details…'
              }
              kind={isCustomSection(section.type)?'custom':section.type}
              icon={isCustomSection(section.type)?'custom':section.type}
            />
          </div>
        ))}
      </div>
      {removedNotice && !active && (
        <p role="status" className="mt-4 text-sm text-muted">
          Section removed.{' '}
          <button
            type="button"
            className="min-h-10 px-2 font-medium text-accent underline"
            onClick={() => {
              addSection(removedNotice,undefined,{},false)
              setRemovedNotice(null)
            }}
          >
            Undo removal
          </button>
        </p>
      )}
      <div hidden={Boolean(active)} className="mt-6 text-center">
        <button
          type="button"
          onClick={() => {
            setAddedNotice('')
            setPickerOpen(true)
          }}
          className="min-h-12 rounded-md bg-accent px-7 text-sm font-semibold text-white"
        >
          <Icon name="plus" className="mr-2 inline-block h-4 w-4" />Add Content
        </button>
      </div>
      {pickerOpen && (
        <AddContentDialog
          existing={extraContent.map((section) => section.type)}
          added={[
            ...coreSections.map(([type]) => type),
            ...extraContent.map((section) => section.type),
          ].filter((type) => !removedSections.includes(type))}
          onAdd={addSection}
          onClose={() => setPickerOpen(false)}
        />
      )}
      <p role="status" className="sr-only top-0 left-0">
        {addedNotice}
      </p>
    </div>
    </>
  )
}
