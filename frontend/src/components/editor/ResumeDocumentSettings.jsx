import Select from "../Select"
import Icon from '../Icon'
import { getDesign } from '../../lib/resumeDesign'

const controls = [
  ['locale', 'Language', { 'en-GB':'English (UK)', 'en-US':'English (US)', 'fr-FR':'French', 'de-DE':'German', 'es-ES':'Spanish' }],
  ['dateFormat', 'Date format', { numeric:'MM/YYYY', iso:'YYYY-MM', short:'Jan 2024', long:'January 2024', year:'2024' }],
  ['page', 'Page size', { A4:'A4', Letter:'US Letter' }],
]

export default function ResumeDocumentSettings({ design, onChange, template }) {
  function reset() {
    const defaults = getDesign(template?.defaults)
    onChange({ ...design, ...Object.fromEntries(controls.map(([key]) => [key, defaults[key]])) })
  }
  return <section data-design-group="document" className="resume-design-card" aria-labelledby="resume-document-settings-title">
    <div className="resume-design-card-heading">
      <h2 id="resume-document-settings-title">Document settings</h2>
      <button type="button" className="design-card-reset" onClick={reset} aria-label="Reset document settings" title="Reset document settings"><Icon name="undo" className="h-4 w-4" /></button>
    </div>
    <div className="document-settings-fields">
      {controls.map(([key, label, options]) => <label key={key} className="document-setting" title={key === 'locale' ? 'Language used for dates. Your written content stays unchanged.' : undefined}>
        <span>{label}</span>
        <span className="document-setting-control">
          <Select aria-label={label} value={design[key]} onChange={(event) => onChange({ ...design, [key]:event.target.value })}>
            {Object.entries(options).map(([value, title]) => <option key={value} value={value}>{title}</option>)}
          </Select>
          <Icon name="down" className="h-4 w-4" />
        </span>
      </label>)}
    </div>
  </section>
}
