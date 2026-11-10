import { useId } from 'react'

export default function CustomizationTabs({ value, onChange, children }) {
  const id = useId()
  const tabs = ['general', 'sections']
  return <>
    <div className="customization-tabs" role="tablist" aria-label="Customization">
      {tabs.map((tab, index) => <button key={tab} id={`${id}-${tab}`} type="button" role="tab" aria-selected={value === tab} aria-controls={`${id}-panel`} tabIndex={value === tab ? 0 : -1} onClick={() => onChange(tab)} onKeyDown={(event) => {
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : ['ArrowLeft', 'ArrowRight'].includes(event.key) ? 1 - index : undefined
        if (next !== undefined) { event.preventDefault(); onChange(tabs[next]); event.currentTarget.parentElement.children[next].focus() }
      }}><strong>{tab === 'general' ? 'General' : 'Sections'}</strong></button>)}
    </div>
    <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-${value}`} className="space-y-5">{children}</div>
  </>
}
