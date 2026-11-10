import { useId } from 'react'
import Icon from '../Icon'

export default function ResumeCustomizationGroups({value,onChange,sections,children}) {
  const id=useId()
  return <div className="resume-customization-groups">{[['general','General',children],['sections','Section customizations',sections]].map(([key,label,content])=><div key={key} className="resume-customization-group" data-customization-group={key}>
    <button id={`${id}-${key}`} type="button" className="resume-customization-heading" aria-expanded={value===key} aria-controls={`${id}-${key}-content`} onClick={()=>onChange(value===key?null:key)}><span className="resume-customization-icon"><Icon name={key==='general'?'window':'file'} className="h-5 w-5"/></span><span className="resume-customization-label">{label}</span><Icon name={value===key?'up':'down'} className="resume-customization-chevron h-4 w-4"/></button>
    {value===key && <div id={`${id}-${key}-content`} role="region" aria-labelledby={`${id}-${key}`} className="resume-customization-content">{content}</div>}
  </div>)}</div>
}
