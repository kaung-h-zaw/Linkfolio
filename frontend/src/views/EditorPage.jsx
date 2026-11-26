import { isCustomSection } from '../lib/contentCatalog'
import { resumeContent, resolvePortfolioSource } from '../lib/portfolioSource'
import useStyleHistory from '../lib/useStyleHistory'
import { getPortfolioTemplate } from '../lib/portfolioTemplates'
import PortfolioPanel from '../components/editor/PortfolioPanel'
import PortfolioDevicePreview from '../components/PortfolioDevicePreview'
import PortfolioEditorPreview from '../components/PortfolioEditorPreview'
import { defaultPortfolio } from '../lib/portfolio'
import DesignPanel from '../components/editor/DesignPanel'
import { changeResumeTemplate, rememberTemplateDesigns, resumeStyleFromDocument } from '../lib/resumeTemplateDesign'
import { getProjects, getCertifications, getLanguages } from '../lib/additionalSections'
import { getEducation, getSkills } from '../lib/educationSkills'
import { useEffect, useRef, useState } from 'react'
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import EditorToolbar from '../components/editor/EditorToolbar'
import UnsavedChangesDialog from '../components/editor/UnsavedChangesDialog'
import Icon from '../components/Icon'
import { PreviewSelectionContext } from '../lib/previewSelection'
import ContentPanel from '../components/editor/ContentPanel'
import ResumeEditorPreview from '../components/ResumeEditorPreview'
import ResumeFocusedPreview from '../components/ResumeFocusedPreview'
import { resumeTemplates } from '../components/resumeTemplates'
import { getSummary } from '../lib/summary'
import { getExperience } from '../lib/experience'
import { emptyProfile } from '../lib/profile'
import { useAuth } from '../lib/authContext'
import PublicationPanel from '../components/editor/PublicationPanel'
import { readResumes, refreshResumesOnOpen, subscribeResumes, saveResume } from '../lib/resumeStorage'

function EditorWorkspace({ mode = 'resume' }) {
  const [params] = useSearchParams()
  if (mode === 'resume' && params.get('tab') === 'portfolio') {
    const legacy = new URLSearchParams(params)
    legacy.delete('tab')
    return <Navigate replace to={`/portfolio/editor/design?${legacy}`} />
  }
  return <ResumeEditor key={`${mode}-${params.get('resume') || params.get('template') || 'new'}`} params={params} mode={mode} />
}

function ResumeEditor({ params, mode }) {
  const isPortfolio = mode === 'portfolio'
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [draft] = useState(() => {
    try {
      const saved =
        params.get('resume') && readResumes().find((item) => item.id === params.get('resume'))
      if (params.get('resume') && !saved)
        return {
          error: `This ${mode} could not be found. Return to your workspace to choose another.`,
        }
      return (
        (saved && isPortfolio ? resolvePortfolioSource(saved,readResumes()) : saved) || {
          id: crypto.randomUUID(),
          name: isPortfolio ? 'Untitled portfolio' : 'Untitled resume',
          kind: mode,
          templateId: params.get('template') || 'flowcv-classic-serif',
          removedSections: isPortfolio ? [] : ['summary','experience','education','skills','projects','certifications','languages'],
        }
      )
    } catch {
      return {
        error: 'Saved work could not be read. Return to your workspace and try again.',
      }
    }
  })
  const [resumeTab, setResumeTab] = useState('content')
  const [personalEditRequest, setPersonalEditRequest] = useState(0)
  const tab = isPortfolio ? (pathname.endsWith('/design') ? 'design' : pathname.endsWith('/share') ? 'share' : 'content') : resumeTab
  const [publishJump, setPublishJump] = useState(0)
  useEffect(() => {
    if (!publishJump || !isPortfolio || tab !== 'share') return
    const frame = requestAnimationFrame(() => {
      const publication = document.getElementById('portfolio-publication')
      publication?.focus({ preventScroll: true })
      publication?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    })
    return () => cancelAnimationFrame(frame)
  }, [publishJump, isPortfolio, tab, pathname])
  function setTab(value) {
    if (isPortfolio) navigate(`/portfolio/editor${value === 'design' ? '/design' : value === 'share' ? '/share' : ''}?${params}`)
    else setResumeTab(value)
  }
  const [resumeStyle, setResumeStyle, resumeStyleHistory] = useStyleHistory(() => resumeStyleFromDocument(draft,resumeTemplates))
  const [customizationTab, setCustomizationTab] = useState('general')
  const [selectedDesignSection, setSelectedDesignSection] = useState('')
  const sectionControlProps = { customizationTab, onCustomizationTabChange: setCustomizationTab, selectedSection: selectedDesignSection, onSelectSection: selectDesignSection }
  const { templateId, design } = resumeStyle
  const [portfolio, setPortfolio, portfolioStyleHistory] = useStyleHistory(() => ({
    ...defaultPortfolio,
    ...draft.portfolio,
    languages: draft.portfolio ? draft.portfolio.languages === true : defaultPortfolio.languages,
    template:getPortfolioTemplate(draft.portfolio?.template || defaultPortfolio.template).id,
  }), ['template', 'design', 'color', 'surface', 'sectionLayouts', 'sectionTitles', 'extraSectionVisibility', 'about', 'projects', 'experience', 'education', 'skills', 'certifications', 'languages', 'contact'])
  function updatePortfolio(value) {
    setPortfolio(value)
    setNotice('Unsaved changes')
  }
  function updateDesign(value) {
    setResumeStyle((current) => ({ ...current, design: value }))
    setNotice('Unsaved changes')
  }
  function changeTemplate(value) {
    setResumeStyle(current => changeResumeTemplate(current,value,resumeTemplates))
    setNotice('Unsaved changes')
  }
  const withNotice = (history) => ({
    ...history,
    undo: () => { history.undo(); setNotice('Unsaved changes') },
    redo: () => { history.redo(); setNotice('Unsaved changes') },
  })
  const [personal, setPersonal] = useState(() => ({
    ...emptyProfile.personal,
    fullName: user.fullName,
    email: user.email,
    ...draft.personal,
  }))
  const [summarySection, setSummarySection] = useState(() =>
    getSummary({
      ...emptyProfile,
      ...draft,
      personal,
      summarySection: draft.summarySection,
    }),
  )
  const [experienceSection, setExperienceSection] = useState(() =>
    getExperience({
      ...emptyProfile,
      ...draft,
      experienceSection: draft.experienceSection,
    }),
  )
  const [educationSection, setEducationSection] = useState(() =>
    getEducation({
      ...emptyProfile,
      ...draft,
      educationSection: draft.educationSection,
    }),
  )
  const [skillsSection, setSkillsSection] = useState(() =>
    getSkills({ ...emptyProfile, ...draft, skillsSection: draft.skillsSection }),
  )
  function updateEducation(value) {
    setEducationSection(value)
    setNotice('Unsaved changes')
  }
  function updateSkills(value) {
    setSkillsSection(value)
    setNotice('Unsaved changes')
  }
  const [projectsSection, setProjectsSection] = useState(() =>
    getProjects({ ...emptyProfile, ...draft, projectsSection: draft.projectsSection }),
  )
  const [certificationsSection, setCertificationsSection] = useState(() =>
    getCertifications({
      ...emptyProfile,
      ...draft,
      certificationsSection: draft.certificationsSection,
    }),
  )
  const [languagesSection, setLanguagesSection] = useState(() =>
    getLanguages({
      ...emptyProfile,
      ...draft,
      languagesSection: draft.languagesSection,
    }),
  )
  function updateProjects(value) {
    setProjectsSection(value)
    setNotice('Unsaved changes')
  }
  function updateCertifications(value) {
    setCertificationsSection(value)
    setNotice('Unsaved changes')
  }
  function updateLanguages(value) {
    setLanguagesSection(value)
    setNotice('Unsaved changes')
  }
  const [removedSections, setRemovedSections] = useState(() => draft.removedSections || [])
  function updateRemovedSections(value) {
    setRemovedSections(value)
    setNotice('Unsaved changes')
  }
  const [extraContent, setExtraContent] = useState(() => draft.extraContent || [])
  function updateExtraContent(value) {
    const visibility=value.filter((section)=>isCustomSection(section.type) && (section.showInResume !== false) !== (extraContent.find((previous)=>previous.type===section.type)?.showInResume !== false))
    if(visibility.length) setResumeStyle((current)=>({...current,design:{...current.design,sectionStyles:{...current.design.sectionStyles,...Object.fromEntries(visibility.map((section)=>[section.type,{...current.design.sectionStyles?.[section.type],hidden:section.showInResume===false}]))}}}))
    setExtraContent(value)
    setNotice('Unsaved changes')
  }
  function useResumeContent(id) {
    const source = readResumes().find((item) => item.id === id && item.kind !== 'portfolio')
    if (!source) return
    const loaded = { ...emptyProfile,...source,personal:{ ...emptyProfile.personal,...source.personal } }
    updatePortfolio({...portfolio,headline:'',sourceResume:{id:source.id,name:source.name}})
    setResumeStyle(resumeStyleFromDocument(source,resumeTemplates))
    setPersonal(loaded.personal)
    setSummarySection(getSummary(loaded))
    setExperienceSection(getExperience(loaded))
    setEducationSection(getEducation(loaded))
    setSkillsSection(getSkills(loaded))
    setProjectsSection(getProjects(loaded))
    setCertificationsSection(getCertifications(loaded))
    setLanguagesSection(getLanguages(loaded))
    setRemovedSections(source.removedSections || [])
    setExtraContent(source.extraContent || [])
    setNotice('Unsaved changes')
  }
  const profile = {
    templateId,
    design,
    extraContent,
    removedSections,
    ...emptyProfile,
    personal,
    summarySection,
    experienceSection,
    educationSection,
    skillsSection,
    projectsSection,
    certificationsSection,
    languagesSection,
  }
  function updateExperience(value) {
    setExperienceSection(value)
    setNotice('Unsaved changes')
  }
  function updateSummary(value) {
    setSummarySection(value)
    setNotice('Unsaved changes')
  }
  const sourceId=isPortfolio?(portfolio.sourceResume?.id||(draft.kind!=='portfolio'?draft.id:null)):draft.id
  const pendingExternalRefresh = useRef(false)
  const editorDirty = useRef(false)
  useEffect(()=>{
    if(!sourceId || draft.error)return
    let active=true
    const sync=()=>{
      if(!active)return
      const source=readResumes().find(item=>item.id===sourceId&&item.kind!=='portfolio')
      if(!source)return
      // A resume can be updated outside this tab (for example by demo seeding).
      // Refresh the editor only while it is clean, so a server refresh never
      // overwrites changes currently being made here.
      if(!isPortfolio && editorDirty.current)return
      const content=resumeContent(source)
      if(!isPortfolio)pendingExternalRefresh.current=true
      setPersonal(content.personal);setSummarySection(content.summarySection);setExperienceSection(content.experienceSection)
      setEducationSection(content.educationSection);setSkillsSection(content.skillsSection);setProjectsSection(content.projectsSection)
      setCertificationsSection(content.certificationsSection);setLanguagesSection(content.languagesSection)
      setRemovedSections(content.removedSections);setExtraContent(content.extraContent)
      setResumeStyle(resumeStyleFromDocument(source,resumeTemplates))
    }
    const unsubscribe=subscribeResumes(sync)
    sync()
    const stopRefresh=refreshResumesOnOpen()
    return ()=>{active=false;unsubscribe();stopRefresh()}
  },[sourceId, setResumeStyle, isPortfolio, draft.error])
  const [notice, setNotice] = useState('')
  function updatePersonal(value) {
    if (value.photo && value.photo !== personal.photo) setResumeStyle(current => ({ ...current, design:{ ...current.design, photoShow:true } }))
    setPersonal(value)
    setNotice('Unsaved changes')
  }
  const template = resumeTemplates.find((item) => item.id === templateId) || resumeTemplates[0]
  const snapshot = JSON.stringify(isPortfolio ? {portfolio} : {profile,templateDesigns:resumeStyle.templateDesigns})
  const [savedSnapshot, setSavedSnapshot] = useState(snapshot)
  const hasUnsavedChanges = !draft.error && snapshot !== savedSnapshot
  useEffect(() => { editorDirty.current = hasUnsavedChanges }, [hasUnsavedChanges])
  useEffect(() => {
    if (!pendingExternalRefresh.current) return
    pendingExternalRefresh.current = false
    setSavedSnapshot(snapshot)
    setNotice('')
  }, [snapshot])
  const [confirmLeaving, setConfirmLeaving] = useState(false)
  useEffect(() => {
    if (!hasUnsavedChanges) return
    function beforeUnload(event) { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', beforeUnload)
    return () => window.removeEventListener('beforeunload', beforeUnload)
  }, [hasUnsavedChanges])
  async function save(updateUrl = true) {
    if (saving) throw new Error('A save is already in progress. Please wait.')
    setSaving(true)
    try {
      const originalResume = readResumes().find((item) => item.id === draft.id) || draft
      const saved = await saveResume({
        ...draft,
        templateId,
        portfolio: isPortfolio ? portfolio : draft.portfolio,
        design,
        templateDesigns:rememberTemplateDesigns(resumeStyle),
        extraContent,
        removedSections,
        personal,
        summarySection,
        experienceSection,
        educationSection,
        skillsSection,
        projectsSection,
        certificationsSection,
        languagesSection,
        name: personal.fullName.trim()
          ? `${personal.fullName.trim()} — ${isPortfolio && draft.kind === 'portfolio' ? 'Portfolio' : 'Resume'}`
          : draft.name,
        ...(isPortfolio && draft.kind !== 'portfolio' ? {...resumeContent(originalResume),templateId:originalResume.templateId,design:originalResume.design,templateDesigns:originalResume.templateDesigns,name:originalResume.name} : {}),
      })
      setSavedSnapshot(snapshot)
      setNotice(`${isPortfolio ? 'Portfolio' : 'Resume'} saved to your account.`)
      if (updateUrl && !params.get('resume')) {
        const savedParams = new URLSearchParams(params)
        savedParams.delete('template')
        savedParams.set('resume', saved.id)
        navigate(`${pathname}?${savedParams}`, { replace: true })
      }
      return saved
    } catch (error) {
      setNotice(`Could not save: ${error.message}`)
      throw error
    } finally {
      setSaving(false)
    }
  }
  const [view, setView] = useState('content')
  const focusedPreview = view === 'preview'
  const previewHeading = useRef(null)
  const previewButton = useRef(null)
  const workspace = useRef(null)
  const toolbarShell = useRef(null)
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      workspace.current?.style.setProperty('--editor-toolbar-height', `${entry.target.getBoundingClientRect().height}px`)
    })
    observer.observe(toolbarShell.current)
    return () => observer.disconnect()
  }, [])
  function closePreview() {
    setView('content')
    requestAnimationFrame(() => previewButton.current?.focus())
  }
  useEffect(() => {
    if (view !== 'preview') return
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        setView('content')
        previewButton.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [view])
  function scrollToEditor(behavior) {
    const editor = document.getElementById('editor-content')
    editor?.scrollTo({ top: 0, behavior })
  }
  function selectDesignSection(key) {
    setSelectedDesignSection(key)
    requestAnimationFrame(() => {
      const pane = document.querySelector('#editor-preview .editor-preview-canvas')
      if (!pane?.clientHeight) return
      const target = [...pane.querySelectorAll('.resume-page [data-section], .portfolio-editor-canvas [data-section]')].find((section) => section.dataset.section === key)
      if (!target) return
      const bounds = pane.getBoundingClientRect(), section = target.getBoundingClientRect()
      if (section.top < bounds.top + 14 || section.bottom > bounds.bottom - 14) {
        const inset = Math.max(24, (bounds.height - Math.min(section.height, bounds.height * 0.7)) / 2)
        pane.scrollTo({ top: pane.scrollTop + section.top - bounds.top - inset, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
      }
    })
  }
  function showPreview() {
    setView('preview')
    requestAnimationFrame(() => previewHeading.current?.focus({ preventScroll: true }))
  }
  return (
    <div ref={workspace} data-focused-preview={focusedPreview} className="editor-workspace flex h-dvh flex-col overflow-hidden bg-paper">
      {confirmLeaving && <UnsavedChangesDialog
        onClose={() => setConfirmLeaving(false)}
        onLeave={() => navigate(isPortfolio?'/dashboard':'/setup')}
        onSaveAndLeave={async () => { await save(false); navigate(isPortfolio?'/dashboard':'/setup') }}
      />}
      <a
        href="#editor-content"
        className={focusedPreview ? 'hidden' : 'skip-link'}
        onClick={() => setView('content')}
      >
        Skip to content
      </a>
      <div ref={toolbarShell} className="editor-toolbar-shell" hidden={focusedPreview}>
        <EditorToolbar
          profile={draft.error ? undefined : profile}
          mode={mode}
          onHome={(event) => {
            if (!hasUnsavedChanges || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
            event.preventDefault()
            setConfirmLeaving(true)
          }}
          navigation={
          <nav className="editor-main-navigation" aria-label="Editor navigation">
            <div className="editor-panel-view-switch">
              {[['content','Content'],['design','Design'],...(isPortfolio ? [['share','Sharing']] : [])].map(([value,label]) => <button key={value} type="button" className="editor-panel-view-button" aria-current={tab === value ? 'page' : undefined} onClick={() => {
                setTab(value)
                setView('content')
                if (value === 'share') setPublishJump((current) => current + 1)
                requestAnimationFrame(() => scrollToEditor('instant'))
              }}><Icon name={{ content:'file', design:'edit', share:'link' }[value]} className="h-4 w-4" /><span>{label}</span></button>)}
            </div>
          </nav>
          }
          onPreview={view === 'preview' ? closePreview : showPreview}
          isPreview={view === 'preview'}
          previewButtonRef={previewButton}
          onSave={
            draft.error || saving
              ? undefined
              : () => {
                  save().catch(() => {})
                }
          }
          resumeName={
            personal.fullName.trim()
              ? `${personal.fullName.trim()} — ${isPortfolio ? 'Portfolio' : 'Resume'}`
              : draft.name || 'Resume unavailable'
          }
          saveStatus={
            saving
              ? 'Saving…'
              : notice.includes('saved to your account')
                ? 'Saved to your account'
                : notice === 'Unsaved changes'
                  ? notice
                  : draft.updatedAt
                    ? 'Saved to your account'
                    : undefined
          }
        />
      </div>
      {(draft.error || notice.startsWith('Could not')) && (
        <p
          role={draft.error ? 'alert' : 'status'}
          className="shrink-0 border-b border-line bg-white px-5 py-3 text-sm text-muted"
        >
          {draft.error || notice}
        </p>
      )}
      <main
        className={`editor-two-panel-layout grid min-h-0 flex-1 ${view === 'preview' ? 'grid-cols-1' : 'md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]'}`}
      >
        <section
          id="editor-content"
          aria-label={isPortfolio ? 'Portfolio content' : 'Resume content'}
          tabIndex={-1}
          className={`${view === 'content' ? 'block' : 'hidden'} min-h-0 min-w-0 overflow-y-auto overscroll-contain scroll-pt-5 scroll-pb-32`}
        >

          {isPortfolio && tab === 'share' && (
            <div className="editor-publication-wrapper mx-auto max-w-2xl px-4 pt-6 lg:px-8">
              <PublicationPanel
                documentId={draft.id}
                publication={readResumes().find((r) => r.id === draft.id)?.publication}
                onSave={save}
              />
            </div>
          )}
          {isPortfolio && tab !== 'share' && (
            <PortfolioPanel
              {...sectionControlProps}
              key={tab}
              mode={tab}
              profile={profile}
              resumes={readResumes().filter((item) => item.kind !== 'portfolio')}
              onEditResume={async (id) => { try { await save(); navigate(`/editor?resume=${encodeURIComponent(id)}`) } catch { /* Save status displays the error. */ } }}
              linkedResume={draft.kind !== 'portfolio' && draft.id ? {id:draft.id,name:draft.name} : undefined}
              onUseResume={useResumeContent}
              personal={personal}
              projects={projectsSection.entries.filter((entry) => entry.visible)}
              settings={portfolio}
              onChange={updatePortfolio}
              styleHistory={withNotice(portfolioStyleHistory)}
            />
          )}
          {!isPortfolio && <div hidden={tab !== 'content'}>
            <ContentPanel
              personalEditRequest={personalEditRequest}
              mode={mode}
              removedSections={removedSections}
              onRemovedSectionsChange={updateRemovedSections}
              extraContent={extraContent}
              onExtraContentChange={updateExtraContent}
              personal={personal}
              onPersonalChange={updatePersonal}
              summary={summarySection}
              onSummaryChange={updateSummary}
              experience={experienceSection}
              onExperienceChange={updateExperience}
              education={educationSection}
              onEducationChange={updateEducation}
              skills={skillsSection}
              onSkillsChange={updateSkills}
              projects={projectsSection}
              onProjectsChange={updateProjects}
              certifications={certificationsSection}
              onCertificationsChange={updateCertifications}
              languages={languagesSection}
              onLanguagesChange={updateLanguages}
            />
          </div>}
          {!isPortfolio && tab === 'design' && (
            <DesignPanel
              {...sectionControlProps}
              profile={profile}
              onEditPersonal={() => { setTab('content'); setView('content'); setPersonalEditRequest(value => value + 1) }}
              onExtraContentChange={updateExtraContent}
              design={design}
              onChange={updateDesign}
              styleHistory={withNotice(resumeStyleHistory)}
              templateId={template.id}
              onTemplateChange={changeTemplate}
            />
          )}
        </section>
        <aside
          onClickCapture={(event) => {
            if (tab !== 'design' || focusedPreview || event.target.closest('a,button,input,textarea,select')) return
            const section = event.target.closest('[data-section]')
            if (section) {
              setCustomizationTab('sections')
              setSelectedDesignSection(section.dataset.section)
              setView('content')
              requestAnimationFrame(() => requestAnimationFrame(() => {
                const pane=document.getElementById('editor-content')
                const target=[...pane.querySelectorAll('[data-section-customization]')].find(card=>card.dataset.sectionCustomization===section.dataset.section)
                if (target) pane.scrollTo({top:pane.scrollTop+target.getBoundingClientRect().top-pane.getBoundingClientRect().top-(pane.querySelector('.resume-customization-tabs')?.offsetHeight || 0)-16,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})
              }))
            }
          }}
          data-edit-sections={tab === 'design' && !focusedPreview ? 'true' : undefined}
          data-preview-kind={isPortfolio ? 'portfolio' : 'resume'}
          id="editor-preview"
          aria-label={isPortfolio ? 'Portfolio preview' : 'Resume preview'}
          className={`${view === 'preview' ? 'flex' : 'hidden'} min-h-0 min-w-0 flex-col border-line bg-paper md:flex md:border-l`}
        >
          <div
            className="sr-only"
          >
            <h2 ref={previewHeading} tabIndex={-1} className="text-xs font-semibold">
              {isPortfolio ? 'Portfolio preview' : 'Resume preview'}
            </h2>
            <span className="text-[11px] text-muted">Live preview</span>
          </div>
          <div
            tabIndex={0}
            role="region"
            aria-label={isPortfolio ? 'Scrollable portfolio website' : 'Scrollable resume document'}
            className={`min-h-0 flex-1 ${focusedPreview ? 'p-2 sm:p-3 flex flex-col overflow-hidden' : 'editor-preview-canvas overflow-y-auto overscroll-contain'}`}
          >
            <PreviewSelectionContext.Provider value={tab === 'design' && !focusedPreview ? selectedDesignSection : ''}>
            {isPortfolio ? (
              focusedPreview ? (
                <PortfolioDevicePreview
                  profile={profile}
                  settings={portfolio}
                  onExitPreview={closePreview}
                  focused
                />
              ) : (
                <PortfolioEditorPreview profile={profile} settings={portfolio} />
              )
            ) : (
              focusedPreview ? (
                <ResumeFocusedPreview profile={profile} template={template} onExitPreview={closePreview} />
              ) : <ResumeEditorPreview profile={profile} template={template} />
            )}
            </PreviewSelectionContext.Provider>

          </div>
        </aside>
      </main>
    </div>
  )
}

// Switching documents must reset the editor; switching its Content/Design tabs must not.
export default function EditorPage({mode='resume'}) {
  const [params]=useSearchParams()
  return <EditorWorkspace key={`${mode}:${params.get('resume')||params.get('template')||'new'}`} mode={mode}/>
}
