import { useId, useLayoutEffect, useRef, useState } from 'react'
import { isCustomSection } from '../lib/contentCatalog'
import Icon from './Icon'
import { portfolioDisplayName, portfolioInitials } from '../lib/portfolioIdentity'

const sectionIcons = { about:'user', projects:'folder', experience:'briefcase', education:'education', skills:'skills', contact:'mail', certifications:'certifications', languages:'languages' }

export default function PortfolioNavigation({ name, sections, target, sidebar=false }) {
  const id = useId()
  const displayName = portfolioDisplayName(name)
  const nav = useRef(null)
  const owner = useRef(null)
  const previousWidth = useRef(null)
  const measure = useRef(null)
  const more = useRef(null)
  const mobileToggle = useRef(null)
  const [visibleCount, setVisibleCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')
  const signature = sections.map(([key,title])=>`${key}:${title}`).join('|')
  useLayoutEffect(() => {
    function fit() {
      const width = nav.current.clientWidth
      if (previousWidth.current !== null && previousWidth.current !== width) setOpen(false)
      previousWidth.current = width
      if (sidebar && nav.current.parentElement.parentElement.clientWidth > 650) { setVisibleCount(sections.length); return }
      const style = getComputedStyle(nav.current)
      const available = nav.current.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - owner.current.offsetWidth - (parseFloat(style.columnGap) || 20)
      const sizes = [...measure.current.querySelectorAll('[data-measure-link]')].map(link=>link.offsetWidth)
      const moreWidth = measure.current.querySelector('[data-measure-more]').offsetWidth
      const gap = 4
      let used = 0, count = 0
      for (let index=0; index<Math.min(4,sizes.length); index++) {
        const next = used + sizes[index] + (index ? gap : 0)
        const reserve = index < sizes.length-1 ? moreWidth+gap : 0
        if (next + reserve > available) break
        used = next
        count++
      }
      setVisibleCount(count)
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(nav.current)
    observer.observe(owner.current)
    observer.observe(measure.current.firstElementChild)
    return () => observer.disconnect()
  }, [signature, sidebar, sections.length])
  function focusToggle() {
    const toggle = more.current?.getClientRects().length ? more.current : mobileToggle.current
    toggle?.focus({preventScroll:true})
  }
  function close() { setOpen(false); focusToggle() }
  function choose(key, fromMenu=false) {
    setActive(key)
    setOpen(false)
    if (fromMenu) focusToggle()
  }
  const overflow = visibleCount < sections.length
  return <nav ref={nav} aria-label="Portfolio navigation" className="portfolio-nav portfolio-adaptive-nav" data-menu-open={open} onBlur={event=>{
    if(!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
  }} onKeyDown={event=>{
    if(event.key==='Escape' && open) {event.stopPropagation();close()}
  }}>
    <a ref={owner} className="portfolio-nav-name" href={target('hero')} title={name} aria-label={`Back to top — ${displayName}`} onClick={()=>choose('')}><span className="portfolio-nav-monogram" aria-hidden="true">{portfolioInitials(displayName)}</span><span className="portfolio-nav-wordmark">{displayName}</span></a>
    <div className="portfolio-nav-primary">
      {sections.slice(0,visibleCount).map(([key,title])=><a className="portfolio-nav-primary-link" key={key} href={target(key)} aria-current={active===key?'location':undefined} onClick={()=>choose(key)}>{sidebar&&<Icon name={sectionIcons[key] || (isCustomSection(key)?'custom':key)} className="portfolio-nav-section-icon" aria-hidden="true"/>}<span>{title}</span></a>)}
      {overflow && <button ref={more} type="button" className="portfolio-nav-more" aria-expanded={open} aria-controls={id} onClick={()=>setOpen(value=>!value)}>More<Icon name={open?'up':'down'} className="h-4 w-4" /></button>}
    </div>
    {sections.length > 0 && <button ref={mobileToggle} type="button" className="portfolio-menu-toggle" aria-label={open?'Close navigation menu':'Open navigation menu'} aria-expanded={open} aria-controls={id} onClick={()=>setOpen(value=>!value)}><Icon name={open?'close':'menu'} className="h-5 w-5" /></button>}
    {open && <button type="button" tabIndex={-1} className="portfolio-menu-backdrop" aria-label="Dismiss navigation menu" onClick={close} />}
    <div id={id} className="portfolio-nav-links">
      {sections.map(([key,title],index)=><a key={key} href={target(key)} data-primary={index<visibleCount || undefined} aria-current={active===key?'location':undefined} onClick={()=>choose(key,true)}><span className="portfolio-menu-icon"><Icon name={sectionIcons[key] || (isCustomSection(key)?'custom':key)} className="h-4 w-4" /></span><span>{title}</span></a>)}
    </div>
    <div ref={measure} className="portfolio-nav-measure" aria-hidden="true" inert><div>
      {sections.map(([key,title])=><span key={key} data-measure-link className="portfolio-nav-primary-link">{title}</span>)}
      <span data-measure-more className="portfolio-nav-more">More<Icon name="down" className="h-4 w-4" /></span>
    </div></div>
  </nav>
}
