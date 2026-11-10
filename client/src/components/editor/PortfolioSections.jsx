import Icon from '../Icon'
import { useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { portfolioOrder } from '../../lib/portfolioDesign'

export default function PortfolioSections({sections,settings,onChange}) {
  const helpId=useId(),list=useRef(null),drag=useRef(null),positions=useRef(new Map())
  const [floating,setFloating]=useState(null),[dragOrder,setDragOrder]=useState(null),[announcement,setAnnouncement]=useState('')
  const order=dragOrder||portfolioOrder(null,settings.design)
  const rows=[...sections].sort((a,b)=>order.indexOf(a.key)-order.indexOf(b.key))
  const signature=rows.map(row=>row.key).join('|')
  function saveOrder(keys,key,title) {
    onChange({...settings,design:{...settings.design,sectionOrder:keys}})
    setAnnouncement(`${title} moved to position ${keys.indexOf(key)+1} of ${keys.length}.`)
  }
  function reorder(from,to) {
    const keys=rows.map(row=>row.key),start=keys.indexOf(from),end=keys.indexOf(to)
    if(start<0||end<0||start===end)return
    keys.splice(start,1);keys.splice(end,0,from)
    saveOrder(keys,from,rows.find(row=>row.key===from).title)
  }
  useLayoutEffect(()=>{
    const next=new Map()
    for(const row of list.current?.children||[]) {
      const key=row.dataset.orderSection,top=row.offsetTop,before=positions.current.get(key)
      if(before!==undefined&&before!==top&&key!==drag.current?.from&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        row.getAnimations().forEach(animation=>animation.cancel())
        row.animate([{transform:`translateY(${before-top}px)`},{transform:'translateY(0)'}],{duration:180,easing:'ease-out'})
      }
      next.set(key,top)
    }
    positions.current=next
  },[signature])
  function move(event) {
    const current=drag.current
    if(!current)return
    setFloating({...current.box,left:event.clientX-current.offsetX,top:event.clientY-current.offsetY})
    const target=[...list.current.children].find(row=>{
      const box=row.getBoundingClientRect()
      return event.clientY>=box.top&&event.clientY<=box.bottom
    })
    if(target&&target.dataset.orderSection!==current.from) {
      const box=target.getBoundingClientRect(),start=current.order.indexOf(current.from),end=current.order.indexOf(target.dataset.orderSection)
      if((end>start&&event.clientY>=box.top+box.height/2)||(end<start&&event.clientY<=box.top+box.height/2)) {
        const next=[...current.order];next.splice(start,1);next.splice(end,0,current.from)
        current.order=next;setDragOrder(next)
      }
    }
    const pane=document.getElementById('editor-content'),bounds=pane.getBoundingClientRect()
    if(event.clientY>bounds.bottom-48)pane.scrollBy(0,16)
    else if(event.clientY<bounds.top+48)pane.scrollBy(0,-16)
  }
  function finish(event,cancel=false) {
    const current=drag.current
    if(!current)return
    drag.current=null;setFloating(null);setDragOrder(null)
    if(!cancel)saveOrder(current.order,current.from,current.box.title)
    if(list.current?.hasPointerCapture(event.pointerId))list.current.releasePointerCapture(event.pointerId)
  }
  return <section className="resume-design-card space-y-4" aria-label="Arrange portfolio sections">
    <h2 className="font-semibold">Arrange sections</h2>
    <p id={helpId} className="sr-only">Drag to reorder. With a keyboard, use the up and down arrow keys.</p>
    <p role="status" className="sr-only">{announcement}</p>
    <div ref={list} tabIndex={-1} className="section-order-list space-y-2" onPointerMove={move} onPointerUp={finish} onPointerCancel={event=>finish(event,true)} onLostPointerCapture={event=>finish(event,true)} onKeyDown={event=>{if(event.key==='Escape')finish(event,true)}}>
      {rows.map((row,index)=><div key={row.key} data-order-section={row.key} data-dragging={floating?.key===row.key} className="resume-arrange-row" onPointerDown={event=>{
        if(event.button!==0||event.target.closest('label,input'))return
        const bounds=event.currentTarget.getBoundingClientRect(),box={key:row.key,title:row.title,left:bounds.left,top:bounds.top,width:bounds.width,height:bounds.height}
        list.current.focus({preventScroll:true});list.current.setPointerCapture(event.pointerId)
        drag.current={from:row.key,order:rows.map(item=>item.key),box,offsetX:event.clientX-bounds.left,offsetY:event.clientY-bounds.top};setFloating(box)
      }}>
        <button type="button" className="section-drag-handle" aria-label={`Drag ${row.title} to reorder`} aria-describedby={helpId} title="Drag to reorder" onKeyDown={event=>{
          const delta=event.key==='ArrowUp'?-1:event.key==='ArrowDown'?1:0
          if(delta&&rows[index+delta]){event.preventDefault();reorder(row.key,rows[index+delta].key)}
        }}><Icon name="grip" className="h-5 w-5"/></button>
        <Icon name={row.key==='about'?'file':row.key} className="section-order-icon h-4 w-4"/>
        <span className="min-w-0 flex-1 break-words text-xs font-semibold">{row.title}</span>
        <label className="grid min-h-11 min-w-11 cursor-pointer place-items-center"><input type="checkbox" className="accent-accent" aria-label={`Show ${row.title} section`} checked={settings[row.key]!==false} onChange={event=>onChange({...settings,[row.key]:event.target.checked})}/></label>
      </div>)}
    </div>
    {!rows.length&&<p className="text-sm text-muted">Choose a resume with content to arrange its sections.</p>}
    {floating&&createPortal(<div aria-hidden="true" className="section-drag-floating" style={{left:floating.left,top:floating.top,width:floating.width,height:floating.height}}><Icon name="grip" className="h-5 w-5"/><Icon name={floating.key==='about'?'file':floating.key} className="h-4 w-4"/><span>{floating.title}</span></div>,document.body)}
  </section>
}
