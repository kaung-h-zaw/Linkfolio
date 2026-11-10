import { useEffect, useRef } from 'react'
import { selectableResumeTemplates } from '../resumeTemplates'
import ResumePreview from '../ResumePreview'
import { useTemplateAccess } from '../../lib/templateAccess'
export default function DesignTemplatePicker({ profile, selected, onSelect, onClose }) {
  const ref = useRef(null)
  const access = useTemplateAccess()
  useEffect(() => {
    ref.current.showModal()
  }, [])
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="template-picker-title"
      className="fixed inset-0 m-auto h-[85dvh] w-[calc(100%-2rem)] max-w-4xl overflow-hidden rounded-lg border border-line bg-white p-0 backdrop:bg-black/30"
    >
      <div className="flex h-20 items-center justify-between border-b border-line bg-white px-5">
        <h2 id="template-picker-title" className="text-lg font-semibold">
          Choose a template
        </h2>
        <button autoFocus onClick={() => ref.current.close()} className="min-h-11 px-3">
          Close
        </button>
      </div>
      <div className="grid h-[calc(100%-5rem)] auto-rows-max content-start items-start gap-4 overflow-y-auto overscroll-contain bg-paper p-5 sm:grid-cols-2 lg:grid-cols-3">
        {selectableResumeTemplates.map((template) => (
          <button
            key={template.id}
            disabled={!access(template.id, 'resume').allowed}
            onClick={() => {
              onSelect(template.id)
              ref.current.close()
            }}
            aria-pressed={selected === template.id}
            className="min-w-0 self-start overflow-hidden rounded-md border border-line bg-white p-3 text-left hover:border-accent"
          >
            <div className="template-thumbnail relative overflow-hidden rounded border border-line bg-white">
              <div className="thumbnail-sheet absolute top-0 left-0" aria-hidden="true" inert>
                <ResumePreview profile={{ ...profile, design: undefined }} template={template} />
              </div>
            </div>
            <span className="mt-3 block text-sm font-semibold">
              {template.name}
              {!access(template.id, 'resume').enabled
                ? ' · Unavailable'
                : !access(template.id, 'resume').allowed
                  ? ' · Premium'
                  : ''}
              {selected === template.id ? ' · Selected' : ''}
            </span>
            <span className="text-xs text-muted">{template.description}</span>
          </button>
        ))}
      </div>
    </dialog>
  )
}
