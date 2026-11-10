import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import { extractResumeText, createImportedResume, parseResumeText, MAX_IMPORT_TEXT } from '../lib/resumeImport'
import { saveResume } from '../lib/resumeStorage'
import { api } from '../lib/api'
import { useTemplateAccess } from '../lib/templateAccess'
import { selectableResumeTemplates } from '../components/resumeTemplates'

export default function ImportResumePage() {
  const navigate = useNavigate()
  const access = useTemplateAccess()
  const dialog = useRef(null)
  const fileInput = useRef(null)
  const request = useRef(null)
  const [tab, setTab] = useState('file')
  const [stage, setStage] = useState('input')
  const [text, setText] = useState('')
  const [sourceDirty, setSourceDirty] = useState(false)
  const [name, setName] = useState('Imported resume')
  const [parsed, setParsed] = useState(null)
  const [templateId, setTemplateId] = useState('essential')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [progress, setProgress] = useState({ label: 'Reading your resume…', progress: undefined })
  const [dragging, setDragging] = useState(false)
  const [aiAvailable, setAiAvailable] = useState(false)
  const [useAI, setUseAI] = useState(false)
  const busy = stage === 'processing' || stage === 'saving'
  useEffect(() => {
    const element = dialog.current
    const overflow = document.body.style.overflow
    element.showModal()
    document.body.style.overflow = 'hidden'
    const controller = new AbortController()
    api('/resume-import/capabilities', { signal: controller.signal }).then((value) => setAiAvailable(value.ai)).catch(() => {})
    return () => {
      controller.abort()
      request.current?.abort()
      element.close()
      document.body.style.overflow = overflow
    }
  }, [])
  function close() {
    if (stage === 'saving') return
    request.current?.abort()
    navigate('/setup')
  }
  async function process(file) {
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    setStage('processing')
    setError('')
    setNotice('')
    try {
      const source = file ? await extractResumeText(file, { signal: controller.signal, onProgress: setProgress }) : text
      if (!source.trim()) throw new Error('Paste your resume text to continue.')
      setText(source)
      if (file) setName(file.name.replace(/\.[^.]+$/, '').slice(0, 120))
      setProgress({ label: 'Organizing your sections…', progress: undefined })
      let result = parseResumeText(source)
      if (useAI && aiAvailable) {
        setProgress({ label: 'Identifying roles, qualifications and dates…', progress: undefined })
        const response = await api('/resume-import/parse', { method: 'POST', signal: controller.signal, body: { text: source, useAI: true } })
        result = response.parsed
        if (response.warning) setNotice(response.warning)
      }
      controller.signal.throwIfAborted()
      setParsed(result)
      setSourceDirty(false)
      setStage('review')
    } catch (failure) {
      if (!controller.signal.aborted) { setError(failure.message); setStage('input') }
    }
  }
  async function save(event) {
    event.preventDefault()
    if (busy || !parsed || sourceDirty) return
    setError('')
    setStage('saving')
    try {
      const resume = createImportedResume(text, parsed.personal, name, templateId, parsed)
      await saveResume(resume)
      navigate(`/editor?resume=${encodeURIComponent(resume.id)}`)
    } catch (failure) { setError(failure.message); setStage('review') }
  }
  function updatePersonal(key, value) {
    setParsed((current) => ({ ...current, personal: { ...current.personal, [key]: value } }))
  }
  const fieldClass = 'mt-2 min-h-11 w-full rounded-md border border-line bg-white px-3 py-2 text-sm font-normal'
  return (
    <dialog ref={dialog} aria-labelledby="import-title" onCancel={(event) => { event.preventDefault(); close() }}
      className="m-auto max-h-[90dvh] w-[min(640px,94vw)] overflow-y-auto rounded-xl border border-line bg-white p-0 shadow-xl backdrop:bg-ink/45">
      <div className="flex items-center justify-between gap-4 px-6 pt-5 sm:px-8">
        <h2 id="import-title" className="text-2xl font-semibold tracking-tight">
          {busy ? 'Importing your resume' : stage === 'review' ? 'Review your resume' : 'Import Resume'}
        </h2>
        <button type="button" aria-label="Close import" onClick={close} disabled={stage === 'saving'} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-line hover:bg-paper disabled:opacity-50">
          <Icon name="close" className="h-4 w-4" />
        </button>
      </div>
      <div className="p-6 sm:p-8">
        {error && <p role="alert" className="mb-5 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {busy ? (
          <div className="rounded-lg border border-line bg-paper p-6" role="status" aria-live="polite">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-line border-t-accent" />
              <p className="text-sm leading-6">{stage === 'saving' ? 'Saving your editable resume…' : progress.label}</p>
            </div>
            <progress aria-label="Resume processing" max="1" value={progress.progress} className="mt-5 h-2 w-full accent-accent" />
            {stage !== 'saving' && <button type="button" onClick={close} className="mt-5 text-sm text-muted underline">Cancel import</button>}
          </div>
        ) : stage === 'input' ? (
          <>
            <div role="tablist" aria-label="Import method" className="mb-5 grid grid-cols-2 gap-3">
              {[['file','Resume File'],['text','Paste Text']].map(([value, label]) => (
                <button key={value} id={`import-tab-${value}`} role="tab" aria-selected={tab === value} aria-controls={`import-panel-${value}`} tabIndex={tab === value ? 0 : -1}
                  onKeyDown={(event) => { if (['ArrowLeft','ArrowRight'].includes(event.key)) { event.preventDefault(); const next = value === 'file' ? 'text' : 'file'; setTab(next); document.getElementById(`import-tab-${next}`)?.focus() } }}
                  onClick={() => { setTab(value); setError('') }} className={`min-h-11 rounded-md border text-sm font-medium ${tab === value ? 'border-accent bg-sage text-accent' : 'border-line text-muted hover:bg-paper'}`}>
                  {label}
                </button>
              ))}
            </div>
            {tab === 'file' ? (
              <div id="import-panel-file" role="tabpanel" aria-labelledby="import-tab-file" onDragOver={(event) => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)}
                onDrop={(event) => { event.preventDefault(); setDragging(false); const file = event.dataTransfer.files[0]; if (file) process(file) }}
                className={`flex min-h-56 flex-col items-center justify-center rounded-lg border-2 border-dashed p-5 text-center ${dragging ? 'border-accent bg-sage' : 'border-slate-300 bg-paper/50'}`}>
                <p className="text-sm text-muted">Choose a file or drag and drop it here</p>
                <button type="button" onClick={() => fileInput.current.click()} className="button button-green mt-5">Select Resume</button>
                <input ref={fileInput} aria-label="Resume file" type="file" accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp" className="sr-only" tabIndex={-1}
                  onChange={(event) => { const file = event.target.files[0]; event.target.value = ''; if (file) process(file) }} />
                <p className="mt-4 text-xs text-muted">PDF, DOCX, TXT, PNG, JPG · up to 5 MB</p>
              </div>
            ) : (
              <div id="import-panel-text" role="tabpanel" aria-labelledby="import-tab-text">
                <textarea aria-label="Resume text" value={text} onChange={(event) => setText(event.target.value)} maxLength={MAX_IMPORT_TEXT} rows={9} className="w-full rounded-lg border border-line bg-paper p-4 text-sm leading-6" placeholder="Paste your resume text here…" />
                <button type="button" onClick={() => process()} disabled={!text.trim()} className="button button-green mt-5 w-full disabled:opacity-50">Import</button>
              </div>
            )}
            {aiAvailable && <label className="mt-5 flex items-start gap-3 text-sm">
              <input type="checkbox" checked={useAI} onChange={(event) => setUseAI(event.target.checked)} className="mt-1 accent-accent" />
              <span>Use AI-assisted parsing<span className="mt-1 block text-xs leading-5 text-muted">Sends extracted resume text to OpenAI to help organize complex layouts.</span></span>
            </label>}
            <p className="mt-5 text-xs leading-5 text-muted">Unlimited imports. Review the detected details before opening your resume.</p>
          </>
        ) : (
          <form onSubmit={save} className="space-y-5">
            <p className="text-sm leading-6 text-muted">Check your details. Each role and qualification becomes an editable entry.</p>
            {notice && <p role="status" className="rounded-md bg-amber-50 p-3 text-xs leading-5 text-amber-900">{notice}</p>}
            {parsed.warnings.length > 0 && <div className="rounded-md bg-amber-50 p-3 text-xs leading-5 text-amber-900">{parsed.warnings.map((warning) => <p key={warning}>{warning}</p>)}</div>}
            <div className="grid gap-4 sm:grid-cols-2">
              {[['fullName','Full name'],['headline','Professional title'],['email','Email'],['phone','Phone'],['location','Location']].map(([key,label]) => (
                <label key={key} className="text-sm font-medium">{label}<input type={key === 'email' ? 'email' : 'text'} required={key === 'fullName'} value={parsed.personal[key] || ''} maxLength={key === 'email' ? 254 : 200} onChange={(event) => updatePersonal(key, event.target.value)} className={fieldClass} /></label>
              ))}
              <label className="text-sm font-medium">Template<select value={templateId} onChange={(event) => setTemplateId(event.target.value)} className={fieldClass}>
                {selectableResumeTemplates.map((template) => <option key={template.id} value={template.id} disabled={!access(template.id,'resume').allowed}>{template.name}</option>)}
              </select></label>
            </div>
            <div aria-label="Detected sections" className="rounded-lg border border-line p-4">
              {['experience','education','skills','projects','certifications','languages'].filter((key) => parsed[key].length).map((key) => (
                <div key={key} className="flex justify-between gap-4 py-1 text-sm"><span className="capitalize">{key}</span><span className="font-medium text-accent">{parsed[key].length} {parsed[key].length === 1 ? 'entry' : 'entries'}</span></div>
              ))}
              {!!parsed.summary && <p className="py-1 text-sm">Summary detected</p>}
            </div>
            {['experience','education'].filter((key) => parsed[key].length).map((key) => <details key={key} className="rounded-lg border border-line p-4">
              <summary className="cursor-pointer text-sm font-medium">Check {key} details</summary>
              <div className="mt-4 space-y-4">{parsed[key].map((entry, index) => <div key={index} className="grid gap-3 border-t border-line pt-3 sm:grid-cols-2">
                {(key === 'experience' ? [['jobTitle','Job title'],['company','Employer']] : [['degree','Qualification'],['school','School']]).map(([field,label]) => <label key={field} className="text-xs font-medium">{label}<input value={entry[field]} onChange={(event) => setParsed((current) => ({ ...current, [key]: current[key].map((value,i) => i === index ? { ...value, [field]: event.target.value } : value) }))} className={fieldClass} /></label>)}
              </div>)}</div>
            </details>)}
            <details className="rounded-lg border border-line p-4">
              <summary className="cursor-pointer text-sm font-medium">Review extracted text</summary>
              <textarea aria-label="Resume text" value={text} onChange={(event) => { setText(event.target.value); setSourceDirty(true) }} maxLength={MAX_IMPORT_TEXT} rows={9} className="mt-4 w-full rounded-md border border-line p-3 text-sm leading-6" />
              <button type="button" onClick={() => process()} className="mt-3 text-sm font-medium text-accent underline">Update detected fields from text</button>
            </details>
            {sourceDirty && <p role="status" className="text-xs text-amber-800">Update the detected fields to apply your text changes.</p>}
            <button type="submit" disabled={sourceDirty} className="button button-green w-full disabled:opacity-50">Open in editor<Icon name="arrow" className="h-4 w-4" /></button>
            <button type="button" onClick={() => setStage('input')} className="w-full text-center text-sm text-muted">Choose another file or text</button>
          </form>
        )}
      </div>
    </dialog>
  )
}
