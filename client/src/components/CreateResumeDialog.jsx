import { useEffect, useRef } from 'react'
import Icon from './Icon'

export default function CreateResumeDialog({ onNew, onImport, onClose }) {
  const dialog = useRef(null)
  useEffect(() => {
    const element = dialog.current
    const previousFocus = document.activeElement
    const overflow = document.body.style.overflow
    element.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      element.close()
      document.body.style.overflow = overflow
      previousFocus?.focus({ preventScroll: true })
    }
  }, [])

  return (
    <dialog ref={dialog} aria-labelledby="create-resume-title"
      onCancel={(event) => { event.preventDefault(); onClose() }}
      onClick={(event) => { if (event.target === dialog.current) onClose() }}
      className="m-auto max-h-[90dvh] w-[min(560px,94vw)] overflow-y-auto rounded-xl border border-line bg-white p-6 text-ink shadow-xl backdrop:bg-black/30 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="create-resume-title" className="text-2xl font-semibold tracking-tight">Create a resume</h2>
          
        </div>
        <button type="button" aria-label="Close create resume" onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-line hover:bg-paper">
          <Icon name="close" className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-6 space-y-4">
        {[
          { name: 'Create a new resume', description: 'Choose a template and add your details.', icon: 'file', action: onNew },
          { name: 'Import existing resume', description: 'Upload a PDF or Word file, or paste text.', icon: 'download', action: onImport },
        ].map((option) => (
          <button key={option.name} type="button" onClick={option.action} className="flex w-full items-center gap-4 rounded-lg border border-line p-5 text-left hover:border-accent hover:bg-paper">
            <Icon name={option.icon} className="h-5 w-5 shrink-0 text-accent" />
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{option.name}</span>
              <span className="mt-1 block text-sm leading-6 text-muted">{option.description}</span>
            </span>
            <Icon name="arrow" className="h-4 w-4 shrink-0 text-muted" />
          </button>
        ))}
      </div>
    </dialog>
  )
}
