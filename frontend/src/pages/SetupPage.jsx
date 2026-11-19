import DocumentLibrary from '../components/DocumentLibrary'
import WorkspaceHeader from '../components/WorkspaceHeader'
import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import SetupSidebar from '../components/SetupSidebar'
import TemplateGallery from '../components/TemplateGallery'
import { defaultPortfolio } from '../lib/portfolio'
import Icon from '../components/Icon'
import ImportResumePage from './ImportResumePage'
import CreatePortfolioDialog from '../components/CreatePortfolioDialog'
import CreateResumeDialog from '../components/CreateResumeDialog'
import { hydrateProfile } from '../lib/profile'
import { readResumes, refreshResumesOnOpen, subscribeResumes, saveResume, deleteResume, removePortfolio } from '../lib/resumeStorage'
import ConfirmDialog from '../components/ConfirmDialog'

export default function SetupPage({ importOpen = false }) {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [storage, setStorage] = useState(() => {
    try {
      return { resumes: readResumes(), error: false }
    } catch {
      return { resumes: [], error: true }
    }
  })
  useEffect(()=>{
    const unsubscribe=subscribeResumes(()=>setStorage({resumes:readResumes(),error:false}))
    const stopRefresh=refreshResumesOnOpen()
    return ()=>{unsubscribe();stopRefresh()}
  },[])
  const [actionError, setActionError] = useState('')
  const [busy, setBusy] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [resumeCreateOpen, setResumeCreateOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)
  async function createFromResume(resume, template) {
    if (busy) return
    setBusy(true)
    setActionError('')
    try {
      const copy = {
        ...hydrateProfile(resume), id:crypto.randomUUID(), kind:'portfolio',
        name:`${resume.personal?.fullName || 'My'} — Portfolio`, portfolio:{...defaultPortfolio,template,sourceResume:{id:resume.id,name:resume.name}},
      }
      delete copy.publication
      delete copy.updatedAt
      delete copy.origin
      const saved = await saveResume(copy)
      navigate(`/portfolio/editor?resume=${encodeURIComponent(saved.id)}`)
    } catch (error) {
      setActionError(error.message)
    } finally {
      setBusy(false)
    }
  }
  async function generate(resume) {
    setBusy(true)
    setActionError('')
    try {
      await saveResume({ ...resume, portfolio: {...(resume.portfolio || defaultPortfolio),sourceResume:{id:resume.id,name:resume.name}} })
      navigate(`/portfolio/editor?resume=${encodeURIComponent(resume.id)}`)
    } catch (error) {
      setActionError(error.message)
    } finally {
      setBusy(false)
    }
  }
  async function remove(resume) {
    setPendingDelete(resume)
  }
  async function confirmRemove() {
    const resume = pendingDelete
    if (!resume) return
    setBusy(true)
    try {
      if (portfolio && resume.kind !== 'portfolio') await removePortfolio(resume.id)
      else await deleteResume(resume.id)
      setStorage({ resumes: readResumes(), error: false })
      setPendingDelete(null)
    } catch (error) {
      throw error
    } finally {
      setBusy(false)
    }
  }
  const portfolio = params.get('view') === 'portfolio'
  const portfolios = storage.resumes.filter((resume) => resume.portfolio)
  const resumes = storage.resumes.filter((resume) => resume.kind !== 'portfolio')
  const gallery = params.get('new') === '1'
  return (
    <div className="app-workspace min-h-dvh bg-paper md:flex">
      <a href="#setup-main" className="skip-link">
        Skip to workspace
      </a>
      <SetupSidebar active={portfolio ? 'portfolio' : 'resume'} />
      <main
        id="setup-main"
        tabIndex={-1}
        className={`workspace-main library-main min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-10 lg:py-10 ${!gallery?'resume-library-page':''}`}
      >
        {actionError && !createOpen && (
          <p
            role="alert"
            className="mb-6 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {actionError}{' '}
            <Link to="/premium" className="underline">
              View plans
            </Link>
          </p>
        )}
        {storage.error && (
          <p
            role="alert"
            className="mb-6 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
          >
            Saved work could not be read. Return to your dashboard and try again.
          </p>
        )}
        {portfolio ? (
          <>
            <WorkspaceHeader title="My portfolios" icon="window" actions={<button type="button" disabled={busy} onClick={() => { setActionError(''); setCreateOpen(true) }} className="button button-green disabled:opacity-50"><Icon name="plus" className="h-4 w-4" />Create portfolio</button>}><p className="workspace-header-count">{portfolios.length} {portfolios.length === 1 ? 'portfolio' : 'portfolios'}</p></WorkspaceHeader>
            <DocumentLibrary key="portfolios" records={portfolios} portfolio busy={busy} onCreate={() => { setActionError(''); setCreateOpen(true) }} onDelete={remove} />
          </>
        ) : (
          <>
            <WorkspaceHeader title="My resumes" icon="file" actions={<><Link to="/resume/import" className="button button-outline"><Icon name="upload" className="h-4 w-4"/>Import resume</Link><button type="button" onClick={() => setResumeCreateOpen(true)} className="button button-green"><Icon name="plus" className="h-4 w-4" />Create resume</button></>}><p className="workspace-header-count">{resumes.length} {resumes.length === 1 ? 'resume' : 'resumes'}</p></WorkspaceHeader>
            <DocumentLibrary key="resumes" records={resumes} busy={busy} onCreate={() => setResumeCreateOpen(true)} onGenerate={generate} onDelete={remove} />
          </>
        )}
      </main>
      {!portfolio && !importOpen && gallery && <TemplateGallery modal hasStarted onBack={() => navigate('/setup')} onChoose={(template) => navigate(`/editor?template=${template.id}`)} />}
      {!portfolio && !importOpen && resumeCreateOpen && (
        <CreateResumeDialog
          onClose={() => setResumeCreateOpen(false)}
          onNew={() => { setResumeCreateOpen(false); navigate('/setup?new=1') }}
          onImport={() => { setResumeCreateOpen(false); navigate('/resume/import') }}
        />
      )}
      {importOpen && <ImportResumePage />}
      {portfolio && createOpen && <CreatePortfolioDialog resumes={resumes} busy={busy} error={actionError} onResume={createFromResume} onClose={() => setCreateOpen(false)} />}
      {pendingDelete && <ConfirmDialog
        title={`Delete this ${portfolio ? 'portfolio' : 'resume'}?`}
        description={`Delete ${portfolio ? 'this portfolio and its messages and analytics' : 'this resume and any linked portfolio'}? This cannot be undone.`}
        onConfirm={confirmRemove}
        onClose={() => setPendingDelete(null)}
      />}
    </div>
  )
}
