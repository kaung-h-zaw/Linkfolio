import { useEffect, useRef } from 'react'
import Icon from './Icon'

export default function AddContentDialog({
  sections,
  visibleSections,
  onAdd,
  onClose,
}) {
  const dialog = useRef(null)
  useEffect(() => {
    const element = dialog.current
    const trigger = document.activeElement
    const previousOverflow = document.body.style.overflow
    element.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      element.close()
      document.body.style.overflow = previousOverflow
      if (trigger?.isConnected) trigger.focus()
    }
  }, [])
  return (
    <dialog
      ref={dialog}
      id="add-content-options"
      aria-labelledby="add-content-title"
      aria-describedby="add-content-description"
      onCancel={onClose}
      className="m-auto max-h-[90svh] w-[min(1440px,94vw)] overflow-y-auto rounded-xl border border-line bg-white p-0 shadow-xl backdrop:bg-ink/45"
    >
      <div className="sticky top-0 z-10 flex justify-end bg-white px-4 pt-4">
        <button
          type="button"
          autoFocus
          aria-label="Close Add Content"
          onClick={onClose}
          className="flex h-11 w-11 items-center justify-center rounded-md border border-line text-muted hover:bg-paper"
        >
          <Icon name="close" />
        </button>
      </div>
      <div className="px-5 pb-8 sm:px-10 sm:pb-10">
        <div className="flex flex-wrap items-center gap-x-10 gap-y-5">
          <div>
            <h2
              id="add-content-title"
              className="text-3xl font-semibold tracking-tight sm:text-3xl"
            >
              Add content
            </h2>
            <p
              id="add-content-description"
              className="mt-3 text-base text-muted"
            >
              Choose a section to add to your resume.
            </p>
          </div>
          <div className="flex items-center gap-4 rounded-lg border border-line bg-sage/40 p-4 sm:ml-auto">
            <Icon name="file" className="h-6 w-6 shrink-0 text-accent" />
            <div>
              <p className="text-sm font-semibold">Already have a resume?</p>
              <p className="mt-1 text-sm text-muted">
                Resume import is coming soon.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sections
            .filter(([key]) => key !== 'personal')
            .map(([key, title, description, icon]) => {
              const added = visibleSections.includes(key)
              return (
                <button
                  key={key}
                  type="button"
                  disabled={added}
                  aria-label={`${title}${added ? ' — Already added' : ''}`}
                  onClick={() => onAdd(key)}
                  className={` ${key === 'custom' ? '!border-dashed !border-muted/60' : ''} group min-h-40 rounded-lg border border-transparent bg-[#f4f5f3] p-6 text-left transition-colors hover:border-accent/40 hover:bg-sage/50 disabled:cursor-default disabled:bg-paper disabled:text-muted sm:min-h-44`}
                >
                  <span className="flex items-center gap-3 text-lg font-semibold sm:text-xl">
                    <Icon name={icon} className="h-6 w-6 shrink-0" />
                    {title}
                  </span>
                  <span className="mt-3 block text-base leading-7 text-muted">
                    {description}
                  </span>
                  {added && (
                    <span className="mt-3 flex items-center gap-2 text-xs font-medium text-accent">
                      <Icon name="check" className="h-4 w-4" />
                      Already added
                    </span>
                  )}
                </button>
              )
            })}
        </div>
        <p className="mt-6 text-sm text-muted">
          Choose a section to start editing. You can add more later.
        </p>
      </div>
    </dialog>
  )
}
