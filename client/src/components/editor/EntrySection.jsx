import { Suspense, useEffect, useId, useRef, useState } from 'react'
import Icon from '../Icon'

export default function EntrySection({
  section, onRemove, onChange, onEditingChange, EntryEditor, createEntry,
  entryLabel, entryDescription, kind, icon, defaultOpen = false, controls, editEntryId,
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [selected, setSelected] = useState(null)
  const [renaming, setRenaming] = useState(false)
  const [undo, setUndo] = useState(null)
  const root = useRef(null)
  const heading = useRef(null)
  const id = useId()
  // Add Content requests an entry directly; local selection handles row clicks.
  const entry = section.entries.find((item) => item.id === (editEntryId || selected))
  useEffect(() => {
    if (!editEntryId) return
    const frame = requestAnimationFrame(() => {
      document.getElementById('editor-content')?.scrollTo({ top: 0, behavior: 'instant' })
    })
    return () => cancelAnimationFrame(frame)
  }, [editEntryId])
  function toggle() {
    setOpen(!open)
    setRenaming(false)
  }
  function edit(entryId) {
    setSelected(entryId)
    onEditingChange(true)
    requestAnimationFrame(() => root.current?.scrollIntoView({ block:'start' }))
  }
  function done() {
    setSelected(null)
    onEditingChange(false)
    setOpen(true)
    requestAnimationFrame(() => {
      heading.current?.focus({ preventScroll:true })
      root.current?.scrollIntoView({ block:'start' })
    })
  }
  function add() {
    const next = createEntry()
    onChange({ ...section, entries:[...section.entries, next] })
    edit(next.id)
  }
  function remove(entryId) {
    setUndo(section)
    onChange({ ...section, entries:section.entries.filter((item) => item.id !== entryId) })
    if (entry?.id === entryId) done()
  }
  function visibility(item) {
    onChange({ ...section, entries:section.entries.map((row) => row.id === item.id ? { ...row,visible:!row.visible } : row) })
  }
  return <div ref={root} className="entry-section-root">
    {entry && controls && <details className="custom-section-entry-settings"><summary>Section settings</summary>{controls}</details>}
    {entry ? <Suspense fallback={<p role="status" className="p-6 text-sm text-muted">Opening section editor…</p>}>
      <EntryEditor key={entry.id} entry={entry}
        onChange={(value) => onChange({ ...section,entries:section.entries.map((item) => item.id === value.id ? value : item) })}
        onDone={done} onDelete={() => remove(entry.id)} />
    </Suspense> : <section className="editor-content-card editor-entry-card">
      <div className="entry-section-heading" onClick={(event) => { if (!event.target.closest('button')) toggle() }}>
        <h2>
          <button ref={heading} type="button" aria-label={section.heading.trim() || 'Section'} aria-expanded={open} aria-controls={id} onClick={toggle} className="entry-section-toggle">
            <span className="entry-section-icon"><Icon name={icon} className="h-5 w-5" /></span>
            <span className="entry-section-name">{section.heading.trim() || 'Section'}</span>
            <span className="entry-section-count" aria-label={`${section.entries.length} entries`}>{section.entries.length}</span>
          </button>
        </h2>
        {open && !controls && <button type="button" aria-label="Edit heading" title="Edit heading" aria-expanded={renaming} aria-controls={`${id}-heading`} onClick={() => setRenaming(!renaming)} className="entry-heading-edit">
          <Icon name="edit" className="h-3.5 w-3.5" /><span>Edit heading</span>
        </button>}
        <button type="button" className="entry-section-chevron" aria-label={`${open ? 'Collapse' : 'Expand'} ${section.heading.trim() || 'section'}`} aria-expanded={open} aria-controls={id} onClick={toggle}>
          <Icon name={open ? 'up' : 'down'} className="h-4 w-4" />
        </button>
      </div>
      {renaming && <form id={`${id}-heading`} className="entry-heading-form" onSubmit={(event) => {
        event.preventDefault()
        setRenaming(false)
        heading.current?.focus()
      }}>
        <label>Section heading<input autoFocus aria-label="Section heading" value={section.heading} maxLength={80} onChange={(event) => onChange({ ...section,heading:event.target.value })} /></label>
        <button className="button button-green">Done heading</button>
      </form>}
      <div id={id} hidden={!open} className="entry-section-body">
        {section.entries.length ? section.entries.map((item, index) => <div className="entry-list-item" key={item.id}>
          <button type="button" aria-label={`Edit ${kind} entry ${index + 1}`} className="entry-list-edit" onClick={() => edit(item.id)}>
            <span className={`line-clamp-2 font-medium ${item.visible ? 'text-ink' : 'text-muted'}`}>{entryLabel(item)}</span>
            {entryDescription && <span className="entry-list-description">{entryDescription(item)}</span>}
            {!item.visible && <span className="entry-list-description">Hidden from resume</span>}
          </button>
          <div className="entry-row-actions">
            <button type="button" className="entry-icon-button" aria-label={`${item.visible ? 'Hide' : 'Show'} ${kind} entry ${index + 1}`} title={item.visible ? 'Hide from resume' : 'Show on resume'} aria-pressed={!item.visible} onClick={() => visibility(item)}>
              <Icon name={item.visible ? 'eye' : 'hidden'} className="h-4 w-4" />
            </button>
            <button type="button" className="entry-icon-button entry-delete-button" aria-label={`Delete ${kind} entry ${index + 1}`} title="Delete entry" onClick={() => remove(item.id)}><Icon name="trash" className="h-4 w-4" /></button>
          </div>
        </div>) : <p className="entry-empty">Add your first entry.</p>}
        <div className="entry-section-footer">
          <button type="button" onClick={add} className="entry-add-button"><Icon name="plus" className="h-4 w-4" />Add Entry</button>
          {onRemove && <button type="button" onClick={onRemove} aria-label="Remove section" title="Remove section" className="entry-remove-button"><Icon name="trash" className="h-4 w-4" /></button>}
        </div>
      </div>
    </section>}
    {undo && <p role="status" className="mt-3 text-xs text-muted">Entry deleted. <button type="button" onClick={() => { onChange({ ...section,entries:undo.entries }); setUndo(null) }} className="min-h-9 px-2 font-semibold text-accent underline">Undo deletion</button></p>}
  </div>
}
