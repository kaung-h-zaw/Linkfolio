import { useRef, useState } from 'react'

export default function DesignWorkbench({ items, value, onChange, children }) {
  const root = useRef(null)
  const [active, setActive] = useState('style')
  const current = value === 'sections' ? 'sections' : active === 'sections' ? 'style' : active
  function go(item) {
    setActive(item.key)
    onChange(item.key === 'sections' ? 'sections' : 'general')
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const target = root.current?.querySelector(item.selector)
      if (!target) return
      let ancestor = target
      while (ancestor && ancestor !== root.current) {
        if (ancestor.tagName === 'DETAILS') ancestor.open = true
        ancestor = ancestor.parentElement
      }
      target.setAttribute('tabindex', '-1')
      target.focus({ preventScroll: true })
      const pane = document.getElementById('editor-content')
      if (pane) pane.scrollTo({ top:pane.scrollTop + target.getBoundingClientRect().top - pane.getBoundingClientRect().top - 16, behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
    }))
  }
  return <div className="design-workbench" ref={root}>
    <nav className="design-settings-navigation" aria-label="Design settings">
      {items.map((item) => <button type="button" key={item.key} aria-current={current === item.key ? 'location' : undefined} onClick={() => go(item)}>{item.label}</button>)}
    </nav>
    <div className="design-workbench-content">{children}</div>
  </div>
}
