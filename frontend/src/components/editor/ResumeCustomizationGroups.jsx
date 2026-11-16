import { useEffect, useId, useLayoutEffect, useRef } from 'react'
import Icon from '../Icon'

const tabs = [
  { key:'general', label:'General', name:'General', icon:'window' },
  { key:'sections', label:'Sections', name:'Section customizations', icon:'file' },
]

export default function ResumeCustomizationGroups({ value, onChange, sections, children }) {
  const id = useId()
  const root = useRef(null)
  const buttons = useRef({})
  const positions = useRef({ general:0, sections:0 })
  const active = value === 'sections' ? 'sections' : 'general'
  const activeRef = useRef(active)

  useEffect(() => {
    const pane = root.current.closest('#editor-content')
    if (!pane) return
    const remember = () => { positions.current[activeRef.current] = pane.scrollTop }
    pane.addEventListener('scroll', remember, { passive:true })
    return () => pane.removeEventListener('scroll', remember)
  }, [])

  useLayoutEffect(() => {
    const pane = root.current.closest('#editor-content')
    activeRef.current = active
    pane?.scrollTo({ top:positions.current[active], behavior:'instant' })
  }, [active])

  function choose(key) {
    const pane = root.current.closest('#editor-content')
    if (pane) positions.current[active] = pane.scrollTop
    onChange(key)
  }

  return <div ref={root} className="resume-customization-groups">
    <div className="resume-customization-tabs-shell">
    <div className="resume-customization-tabs" role="tablist" aria-label="Design customization">
      {tabs.map((tab,index) => <button
        key={tab.key}
        ref={node => { buttons.current[tab.key] = node }}
        id={`${id}-${tab.key}`}
        type="button"
        role="tab"
        aria-label={tab.name}
        aria-selected={active === tab.key}
        aria-controls={`${id}-${tab.key}-content`}
        tabIndex={active === tab.key ? 0 : -1}
        onClick={() => choose(tab.key)}
        onKeyDown={event => {
          let next
          if (event.key === 'ArrowRight') next = tabs[(index+1)%tabs.length]
          else if (event.key === 'ArrowLeft') next = tabs[(index+tabs.length-1)%tabs.length]
          else if (event.key === 'Home') next = tabs[0]
          else if (event.key === 'End') next = tabs.at(-1)
          if (!next) return
          event.preventDefault()
          choose(next.key)
          buttons.current[next.key]?.focus({ preventScroll:true })
        }}
      ><Icon name={tab.icon} className="h-4 w-4" /><span>{tab.label}</span></button>)}
    </div>
    </div>
    {tabs.map(tab => <div
      key={tab.key}
      id={`${id}-${tab.key}-content`}
      role="tabpanel"
      aria-labelledby={`${id}-${tab.key}`}
      hidden={active !== tab.key}
      tabIndex={0}
      className="resume-customization-content"
      data-customization-group={tab.key}
    >{active === tab.key && (tab.key === 'general' ? children : sections)}</div>)}
  </div>
}
