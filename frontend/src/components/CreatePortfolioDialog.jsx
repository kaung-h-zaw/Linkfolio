import Select from "./Select"
import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import PortfolioTemplatePicker from './editor/PortfolioTemplatePicker'
import { defaultPortfolio } from '../lib/portfolio'
import { hydrateProfile } from '../lib/profile'

export default function CreatePortfolioDialog({ resumes, busy, error, onResume, onClose }) {
  const dialog = useRef(null)
  const [resumeId, setResumeId] = useState(resumes[0]?.id || '')
  const [templateOpen, setTemplateOpen] = useState(false)
  const selectedResume = resumes.find((item) => item.id === resumeId)
  useEffect(() => {
    const element = dialog.current
    const previousFocus = document.activeElement
    const overflow = document.body.style.overflow
    element.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      element.close()
      document.body.style.overflow = overflow
      previousFocus?.focus({ preventScroll:true })
    }
  }, [])
  return <dialog ref={dialog} aria-labelledby="create-portfolio-title" onCancel={(event) => {
    event.preventDefault()
    if (!busy) onClose()
  }} onClick={(event) => { if (event.target === dialog.current && !busy) onClose() }} className="m-auto max-h-[90dvh] w-[min(560px,94vw)] overflow-y-auto rounded-xl border border-line bg-white p-6 text-ink shadow-xl backdrop:bg-black/30 sm:p-8">
    <div className="flex items-start justify-between gap-4">
      <div><h2 id="create-portfolio-title" className="text-2xl font-semibold tracking-tight">Create a portfolio</h2></div>
      <button type="button" aria-label="Close create portfolio" disabled={busy} onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-line hover:bg-paper disabled:opacity-50"><Icon name="close" className="h-4 w-4" /></button>
    </div>
    {error && <p role="alert" className="mt-5 text-sm text-red-700">{error}</p>}
    <form className="mt-6 rounded-lg border border-line p-5" onSubmit={(event) => {
      event.preventDefault()
      if (selectedResume && !busy) setTemplateOpen(true)
    }}>
      <div className="flex items-center gap-3"><Icon name="file" className="h-5 w-5 text-accent" /><h3 className="font-semibold">Start from a resume</h3></div>
      <p className="mt-2 text-sm leading-6 text-muted">Use your saved details to get started.</p>
      {resumes.length ? <>
        <label className="mt-4 block text-sm font-medium">Choose a resume<Select aria-label="Choose a resume" disabled={busy} value={resumeId} onChange={(event) => setResumeId(event.target.value)} className="mt-2 min-h-11 w-full rounded-md border border-line bg-white px-3 text-sm font-normal">{resumes.map((resume) => <option key={resume.id} value={resume.id}>{resume.name}</option>)}</Select></label>
        <button disabled={busy || !selectedResume} className="button button-green mt-4 w-full disabled:opacity-50">Choose a portfolio style<Icon name="arrow" className="h-4 w-4" /></button>
      </> : <p className="mt-3 text-xs text-muted">Create or import a resume first, then use it to build your portfolio.</p>}
    </form>
    {templateOpen&&selectedResume&&<PortfolioTemplatePicker value={defaultPortfolio.template} profile={hydrateProfile(selectedResume)} settings={defaultPortfolio} onChange={(template)=>{setTemplateOpen(false);onResume(selectedResume,template)}} onClose={()=>setTemplateOpen(false)}/>}
  </dialog>
}
