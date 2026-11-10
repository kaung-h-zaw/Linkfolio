import Icon from '../Icon'
import { getDesign } from '../../lib/resumeDesign'

export default function ResumeEntryLayoutCard({ design, onChange, template }) {
  function clearEntryOverrides() {
    return Object.fromEntries(Object.entries(design.sectionStyles || {}).map(([key,style]) => {
      const next = { ...style }
      delete next.entryLayout
      return [key,next]
    }))
  }
  const set = (key,value) => onChange({ ...design, ...(['entryLayout','metadataPosition'].includes(key) ? { sectionStyles:clearEntryOverrides() } : {}), [key]:value })
  function reset() {
    const defaults = getDesign(template?.defaults)
    onChange({ ...design, sectionStyles:clearEntryOverrides(), ...Object.fromEntries(['entryLayout','metadataPosition','subtitlePlacement','metadataOrder'].map((key) => [key,defaults[key]])) })
  }
  const choices = (key, options) => <div className="entry-setting-choices">{options.map(([value,label]) => <button key={value} type="button" aria-label={`${key === 'metadataPosition' ? 'Date & location position' : key === 'metadataOrder' ? 'Date & location order' : 'Subtitle placement'}: ${label}`} aria-pressed={(design[key] || (key === 'metadataOrder' ? 'date-location' : '')) === value} onClick={() => set(key,value)}>{label}</button>)}</div>
  return <section data-design-group="entries" className="resume-design-card resume-entry-layout-card" aria-labelledby="resume-entry-layout-title">
    <div className="resume-design-card-heading"><h2 id="resume-entry-layout-title">Entry layout</h2><button type="button" className="design-card-reset" aria-label="Reset entry layout" title="Reset entry layout" onClick={reset}><Icon name="undo" className="h-4 w-4" /></button></div>
    <fieldset className="layout-visual-controls"><legend>Structure</legend><div className="entry-structure-choices">{[['full','Full width'],['columns','Columns']].map(([key,label]) => <button key={key} type="button" aria-label={`Entry structure: ${label}`} aria-pressed={design.entryLayout === key} onClick={() => set('entryLayout',key)}>
      <span aria-hidden="true" className="entry-structure-sketch" data-structure={key}><i /><i /><i /><i /><i /><i /></span><span>{label}</span>
    </button>)}</div></fieldset>
    {design.entryLayout === 'columns' && <fieldset className="layout-visual-controls"><legend>Date & location position</legend>{choices('metadataPosition',[['right','Right'],['left','Left'],['split','Split']])}</fieldset>}
    <fieldset className="layout-visual-controls"><legend>Subtitle placement</legend>{choices('subtitlePlacement',[['inline','Same line'],['below','Below title']])}</fieldset>
    <fieldset className="layout-visual-controls"><legend>Date & location order</legend>{choices('metadataOrder',[['date-location','Date – Location'],['location-date','Location – Date']])}</fieldset>
  </section>
}
