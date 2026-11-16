import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Icon from '../Icon'
import { sectionColumn, moveColumnSection, resumeLayout } from '../../lib/resumeColumns'

export default function ResumeColumnBoard({ sections, design, template, onChange }) {
  const board = useRef(null)
  const pointer = useRef(null)
  const positions = useRef(new Map())
  const [dragging, setDragging] = useState(null)
  const [target, setTarget] = useState(null)
  const [draft, setDraft] = useState(null)
  const [floating, setFloating] = useState(null)
  const [announcement, setAnnouncement] = useState('')
  const columns = draft?.sectionColumns || Object.fromEntries(sections.map((section,index) => [section.key,sectionColumn(section.key,index,design,template)]))
  const arranged = draft ? [...sections].sort((a,b) => draft.sectionOrder.indexOf(a.key)-draft.sectionOrder.indexOf(b.key)) : sections
  const signature = arranged.map(section => `${section.key}:${columns[section.key]}`).join('|')
  useLayoutEffect(() => {
    const next = new Map()
    const bounds = board.current.getBoundingClientRect()
    for (const row of board.current.querySelectorAll('[data-column-section]')) {
      const key = row.dataset.columnSection
      const rect = row.getBoundingClientRect()
      const point = {left:rect.left-bounds.left,top:rect.top-bounds.top}
      const previous = positions.current.get(key)
      if (previous && key !== pointer.current?.key && (previous.left !== point.left || previous.top !== point.top) && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        row.getAnimations().forEach(animation => animation.cancel())
        row.animate([{transform:`translate(${previous.left-point.left}px,${previous.top-point.top}px)`},{transform:'translate(0,0)'}],{duration:160,easing:'ease-out'})
      }
      next.set(key,point)
    }
    positions.current = next
  },[signature])
  const headerColumn = design.layout === 'template' && ['flowcv-atlantic-blue','twentyone'].includes(template?.reference) ? 'left' : design.headerPosition || 'top'
  const lanes = headerColumn === 'top' || resumeLayout(design,template) === 'mixed' || Object.values(columns).includes('full') ? ['full','left','right'] : ['left','right']
  function move(key, column, before) {
    onChange({ ...design, ...moveColumnSection(sections,columns,key,column,before) })
    setAnnouncement(`${sections.find(section => section.key === key)?.title} moved to ${column === 'full' ? 'full width' : `the ${column} column`}.`)
  }
  function track(event) {
    const current = pointer.current
    if (!current) return
    if (!current.moved && Math.hypot(event.clientX-current.x,event.clientY-current.y) < 5) return
    current.moved = true
    setDragging(current.key)
    setFloating({...current.box,left:event.clientX-current.offsetX,top:event.clientY-current.offsetY})
    const boardBounds = board.current.getBoundingClientRect()
    const lane = [...board.current.querySelectorAll('[data-column-lane]')].find(element => {
      const box = element.getBoundingClientRect()
      const horizontalSlack = 6
      return event.clientX >= box.left-horizontalSlack && event.clientX <= box.right+horizontalSlack && event.clientY >= box.top && event.clientY <= Math.min(boardBounds.bottom+24,box.bottom+24)
    })
    if (lane) {
      const before = [...lane.querySelectorAll('[data-column-section]')].find(element => element.dataset.columnSection !== current.key && event.clientY < element.getBoundingClientRect().top + element.offsetHeight / 2)
      current.target = { column:lane.dataset.columnLane, before:before?.dataset.columnSection }
      setTarget(current.target)
      const next = moveColumnSection(current.order.map(key => ({key})),current.columns,current.key,current.target.column,current.target.before)
      if (next.sectionOrder.join('|') !== current.order.join('|') || current.columns[current.key] !== current.target.column) {
        current.order = next.sectionOrder
        current.columns = next.sectionColumns
        setDraft(next)
      }
    } else { current.target = null; setTarget(null) }
    const pane = board.current.closest('#editor-content')
    if (pane) {
      const bounds = pane.getBoundingClientRect()
      if (event.clientY > bounds.bottom - 40) pane.scrollBy(0,12)
      else if (event.clientY < bounds.top + 60) pane.scrollBy(0,-12)
    }
  }
  function finish(event, cancel = false) {
    const current = pointer.current
    pointer.current = null
    setDragging(null); setTarget(null); setDraft(null); setFloating(null)
    if (current?.moved && current.target && !cancel) {
      onChange({...design,sectionOrder:current.order,sectionColumns:current.columns})
      setAnnouncement(`${current.box.title} moved to ${current.target.column === 'full' ? 'full width' : `the ${current.target.column} column`}.`)
    }
    if (event.pointerId !== undefined && board.current.hasPointerCapture(event.pointerId)) board.current.releasePointerCapture(event.pointerId)
  }
  return <div className="resume-column-arranger">
    <div className="column-board-heading"><p>Drag sections between columns or use the move button.</p><button type="button" onClick={() => {
      onChange({ ...design, sectionColumns:Object.fromEntries(Object.entries(columns).map(([key,column]) => [key,column === 'left' ? 'right' : column === 'right' ? 'left' : 'full'])) })
      setAnnouncement('Left and right sections exchanged.')
    }}><Icon name="undo" className="h-4 w-4"/>Swap columns</button></div>
    <p role="status" className="sr-only">{announcement}</p>
    <div ref={board} className="resume-column-board" data-drag-active={Boolean(dragging) || undefined} onPointerMove={track} onPointerUp={finish} onPointerCancel={event => finish(event,true)} onLostPointerCapture={event => finish(event,true)} onKeyDown={event => { if (event.key === 'Escape') finish(event,true) }}>
      {lanes.map(column => <div key={column} className="resume-column-lane" data-column-lane={column} data-drop-active={target?.column === column || undefined}>
        <h4>{column === 'full' ? 'Full width' : `${column === 'left' ? 'Left' : 'Right'} column`}</h4>
        {(headerColumn === column || (headerColumn === 'top' && column === 'full')) && <div className="column-board-personal"><Icon name="personal" className="h-5 w-5"/><span>Personal details</span><small>Header</small></div>}
        {arranged.filter(section => columns[section.key] === column).map(section => <div key={section.key} className="column-board-row" data-column-section={section.key} data-dragging={dragging === section.key || undefined} data-drop-placeholder={dragging === section.key && target?.column === column || undefined} onDragStart={event => event.preventDefault()} onPointerDown={event => {
            if (event.button !== 0 || event.target.closest('button:not(.column-board-grip)')) return
            event.currentTarget.querySelector('.column-board-grip')?.focus({preventScroll:true})
            const rect = event.currentTarget.getBoundingClientRect()
            pointer.current = {key:section.key,x:event.clientX,y:event.clientY,moved:false,order:arranged.map(item => item.key),columns:{...columns},box:{key:section.key,title:section.title,left:rect.left,top:rect.top,width:rect.width,height:rect.height},offsetX:event.clientX-rect.left,offsetY:event.clientY-rect.top}
            board.current.setPointerCapture(event.pointerId)
          }}>
          <button type="button" className="column-board-grip" aria-label={`Move ${section.title}. Use left or right arrows to change column, up or down to reorder.`} title="Drag to move section" onKeyDown={event => {
            if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) {
              event.preventDefault()
              if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') move(section.key,event.key === 'ArrowLeft' ? 'left' : 'right')
              else {
                const siblings = sections.filter(item => columns[item.key] === column)
                const index = siblings.findIndex(item => item.key === section.key)
                if (event.key === 'ArrowUp' && index > 0) move(section.key,column,siblings[index-1].key)
                if (event.key === 'ArrowDown' && index < siblings.length-1) move(section.key,column,siblings[index+2]?.key)
              }
            }
          }}><Icon name="grip" className="h-4 w-4"/></button>
          <Icon name={section.key.startsWith('break:') ? 'file' : section.key} className="h-4 w-4"/><span title={section.title}>{section.title}</span>
          <button type="button" className="column-board-move" title={`Move to ${column === 'left' ? 'right' : 'left'} column`} aria-label={`Move ${section.title} to ${column === 'left' ? 'right' : 'left'} column`} onClick={() => move(section.key,column === 'left' ? 'right' : 'left')}><Icon name={column === 'left' ? 'arrow' : 'back'} className="h-4 w-4"/></button>
          {section.key.startsWith('break:') && <button type="button" className="column-board-move" aria-label="Remove page break" onClick={() => onChange({...design,sectionOrder:sections.filter(item => item.key !== section.key).map(item => item.key)})}><Icon name="trash" className="h-4 w-4"/></button>}
          {dragging === section.key && target?.column === column && <small className="column-board-drop-label">Drop {section.title} here</small>}
        </div>)}
        {!sections.some(section => columns[section.key] === column) && <p className="column-board-empty">Drop a section here</p>}
      </div>)}
    </div>
    {floating && createPortal(<div aria-hidden="true" className="section-drag-floating column-board-floating" style={{left:floating.left,top:floating.top,width:floating.width,height:floating.height}}><Icon name="grip" className="h-4 w-4"/><Icon name={floating.key.startsWith('break:') ? 'file' : floating.key} className="h-4 w-4"/><span>{floating.title}</span></div>,document.body)}
  </div>
}
