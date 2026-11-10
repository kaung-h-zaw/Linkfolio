import { useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Icon from '../Icon'
import { resumeDesignSections } from '../../lib/resumeDesignSections'

export default function ResumeSectionOrder({ profile, design, onChange, layout = 'one' }) {
  const helpId = useId()
  const drag = useRef(null)
  const [dragging, setDragging] = useState(null)
  const list = useRef(null)
  const positions = useRef(new Map())
  const [floating, setFloating] = useState(null)
  const [dragOrder, setDragOrder] = useState(null)
  const [announcement, setAnnouncement] = useState('')
  const set = (key, value) => onChange({ ...design, [key]: value })
  const sections = resumeDesignSections(profile, { ...design, sectionOrder: dragOrder || design.sectionOrder })
  function reorder(from, to) {
    const order = sections.map((section) => section.key)
    const start = order.indexOf(from), end = order.indexOf(to)
    if (start < 0 || end < 0 || start === end) return
    order.splice(start, 1)
    order.splice(end, 0, from)
    set('sectionOrder', order)
    setAnnouncement(`${sections.find((item) => item.key === from)?.title} moved to position ${end + 1} of ${order.length}.`)
  }
  const orderSignature = sections.map((item) => item.key).join('|')
  useLayoutEffect(() => {
    const next = new Map()
    for (const row of list.current?.children || []) {
      const key = row.dataset.orderSection
      const point = { top: row.offsetTop, left: row.offsetLeft }
      const before = positions.current.get(key)
      if (before !== undefined && (before.top !== point.top || before.left !== point.left) && key !== drag.current?.from && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        row.getAnimations().forEach((animation) => animation.cancel())
        row.animate([{ transform: `translate(${before.left - point.left}px, ${before.top - point.top}px)` }, { transform: 'translate(0, 0)' }], { duration: 180, easing: 'ease-out' })
      }
      next.set(key, point)
    }
    positions.current = next
  }, [orderSignature, layout, design.columnRatio])
  function moveDrag(event) {
    const current = drag.current
    if (!current) return
    setFloating({ ...current.box, left: event.clientX - current.offsetX, top: event.clientY - current.offsetY })
    const rows = [...list.current.children]
    const listBounds = list.current.getBoundingClientRect()
    const listTop = listBounds.top
    const target = rows.find((row) => {
      const top = listTop + row.offsetTop
      return event.clientY >= top && event.clientY <= top + row.offsetHeight && event.clientX >= listBounds.left + row.offsetLeft && event.clientX <= listBounds.left + row.offsetLeft + row.offsetWidth
    })
    if (target && target.dataset.orderSection !== current.from) {
      const source = rows.find((row) => row.dataset.orderSection === current.from)
      const horizontal = source?.offsetTop === target.offsetTop
      const midpoint = horizontal ? listBounds.left + target.offsetLeft + target.offsetWidth / 2 : listTop + target.offsetTop + target.offsetHeight / 2
      const pointer = horizontal ? event.clientX : event.clientY
      const start = current.order.indexOf(current.from)
      const end = current.order.indexOf(target.dataset.orderSection)
      if ((end > start && pointer >= midpoint) || (end < start && pointer <= midpoint)) {
        const next = [...current.order]
        next.splice(start, 1)
        next.splice(end, 0, current.from)
        current.order = next
        setDragOrder(next)
      }
    }
    const pane = document.getElementById('editor-content')
    const bounds = pane.getBoundingClientRect()
    if (event.clientY > bounds.bottom - 48) pane.scrollBy(0, 16)
    else if (event.clientY < bounds.top + 48) pane.scrollBy(0, -16)
  }
  function finishDrag(event, cancel = false) {
    const current = drag.current
    if (!current) return
    drag.current = null
    setDragging(null)
    setFloating(null)
    setDragOrder(null)
    if (!cancel) {
      set('sectionOrder', current.order)
      setAnnouncement(`${current.box.title} moved to position ${current.order.indexOf(current.from) + 1} of ${current.order.length}.`)
    }
    if (list.current?.hasPointerCapture(event.pointerId)) list.current.releasePointerCapture(event.pointerId)
  }
  return <div className="resume-section-order space-y-4" data-arrange-layout={layout} data-header-position={design.headerPosition || 'top'} style={{ '--arrange-left':`${design.columnRatio ?? 50}fr`, '--arrange-right':`${100 - (design.columnRatio ?? 50)}fr` }}>
        <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-medium">Section order</h3><button type="button" onClick={() => set('sectionOrder', [])} className="min-h-10 text-xs text-accent underline">Reset section order</button></div>
        <p id={helpId} className="sr-only">Use the drag handle to reorder. With a keyboard, use the up and down arrow keys.</p>
        <p role="status" className="sr-only">{announcement}</p>
        <div className="section-order-personal"><Icon name="personal" className="h-5 w-5" /><span>Personal details</span></div>
        <div ref={list} tabIndex={-1} className="section-order-list space-y-2" onPointerMove={moveDrag} onPointerUp={finishDrag} onPointerCancel={(event) => finishDrag(event, true)} onLostPointerCapture={(event) => finishDrag(event, true)} onKeyDown={(event) => { if (event.key === 'Escape') finishDrag(event, true) }}>
          {sections.map((section, index) => (
            <div key={section.key} data-order-section={section.key} data-dragging={dragging === section.key} className="resume-arrange-row" data-page-break={section.key.startsWith('break:')}
                onPointerDown={(event) => {
                  if (event.button !== 0 || event.target.closest('[data-remove-break]')) return
                  const bounds = event.currentTarget.getBoundingClientRect()
                  const box = { key: section.key, title: section.title, left: bounds.left, top: bounds.top, width: bounds.width, height: bounds.height }
                  list.current.focus({ preventScroll: true })
                  list.current.setPointerCapture(event.pointerId)
                  drag.current = { from: section.key, order: sections.map((item) => item.key), box, offsetX: event.clientX - bounds.left, offsetY: event.clientY - bounds.top }
                  setDragging(section.key)
                  setFloating(box)
                }}
            >
              <button
                type="button"
                className="section-drag-handle"
                aria-label={`Drag ${section.title} to reorder`}
                aria-describedby={helpId}
                title="Drag to reorder"
                onKeyDown={(event) => {
                  const delta = event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : 0
                  if (delta && sections[index + delta]) {
                    event.preventDefault()
                    reorder(section.key, sections[index + delta].key)
                  }
                }}
              ><Icon name="grip" className="h-5 w-5" /></button>
              <Icon name={section.key.startsWith('break:') ? 'file' : section.key} className="section-order-icon h-4 w-4" />
              <span className="min-w-0 flex-1 break-words text-xs font-semibold">
                {section.title}
              </span>
              {section.key.startsWith('break:') && (
                <button
                  type="button"
                  data-remove-break
                  aria-label="Remove page break"
                  title="Remove page break"
                  onClick={() =>
                    set(
                      'sectionOrder',
                      sections.filter((item) => item.key !== section.key).map((item) => item.key),
                    )
                  }
                  className="section-order-remove"
                >
                  <Icon name="trash" className="h-4 w-4" />
                </button>
              )}

            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            set('sectionOrder', [
              ...sections.map((section) => section.key),
              'break:' + crypto.randomUUID(),
            ])
          }
          className="min-h-11 rounded-md border border-dashed border-accent px-4 text-sm text-accent"
        >
          Add page break
        </button>
    {floating && createPortal(<div aria-hidden="true" className="section-drag-floating" style={{ left: floating.left, top: floating.top, width: floating.width, height: floating.height }}>
      <Icon name="grip" className="h-5 w-5" />
      <Icon name={floating.key.startsWith('break:') ? 'file' : floating.key} className="h-4 w-4" />
      <span>{floating.title}</span>
    </div>, document.body)}
  </div>
}
