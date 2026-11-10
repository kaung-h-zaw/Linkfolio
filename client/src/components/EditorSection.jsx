import { useId, useState } from 'react'
import Icon from './Icon'

export default function EditorSection({
  title,
  subtitle,
  icon,
  complete,
  children,
  defaultOpen = false,
}) {
  const [open, setOpen] = useState(defaultOpen)
  const id = useId()
  return (
    <section className="editor-content-card rounded-lg border border-line bg-white">
      <h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen(!open)}
          className="flex w-full items-center gap-3 rounded-lg p-6 sm:p-8 text-left hover:bg-paper"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sage/60 text-accent">
            <Icon name={icon} className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-lg font-semibold">{title}</span>
            <span className="mt-2 block text-sm font-normal text-muted">
              {subtitle}
            </span>
          </span>
          {complete && (
            <span className="text-accent">
              <Icon name="check" className="h-4 w-4" />
              <span className="sr-only">Contains information</span>
            </span>
          )}
          <span aria-hidden="true" className="text-sm font-medium text-accent">
            {open ? 'Close' : 'Edit'}
          </span>
        </button>
      </h2>
      <div id={id} hidden={!open} className="border-t border-line p-6 sm:p-8">
        {children}
      </div>
    </section>
  )
}
