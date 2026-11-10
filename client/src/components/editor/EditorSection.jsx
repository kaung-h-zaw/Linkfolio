import { useId, useState } from 'react'
import Icon from '../Icon'

export default function EditorSection({
  title,
  icon,
  subtitle,
  count,
  repeatable = false,
  children,
}) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <section className="rounded-md border border-line bg-white shadow-[0_1px_2px_0_rgb(0_0_0/0.025)]">
      <h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen(!open)}
          className="flex min-h-18 w-full items-center gap-3 rounded-md px-4 py-4 text-left hover:bg-slate-50"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-slate-200 bg-slate-50 text-slate-500">
            <Icon name={icon} className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold">{title}</span>
            {subtitle && (
              <span className="mt-1 block text-xs font-normal leading-5 text-muted">
                {subtitle}
              </span>
            )}
          </span>
          {count > 0 && (
            <span
              className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-muted"
              aria-label={`${count} entries`}
            >
              {count}
            </span>
          )}
          <Icon name={open ? 'up' : 'down'} className="h-4 w-4 shrink-0 text-slate-400" />
        </button>
      </h2>
      <div id={id} hidden={!open} className="border-t border-line px-4 py-4">
        <div className="space-y-3 text-sm leading-6 text-muted">{children}</div>
        {repeatable && (
          <button
            type="button"
            disabled
            title="Adding entries is coming soon"
            className="mt-4 flex min-h-10 w-full cursor-not-allowed items-center justify-center gap-2 rounded border border-dashed border-slate-300 bg-slate-50 text-xs font-medium text-slate-500"
          >
            <Icon name="plus" className="h-4 w-4" /> Add Entry
          </button>
        )}
      </div>
    </section>
  )
}
