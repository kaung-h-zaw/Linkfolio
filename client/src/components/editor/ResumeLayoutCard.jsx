import Icon from '../Icon'
import ResumeSectionOrder from './ResumeSectionOrder'
import { getDesign } from '../../lib/resumeDesign'

const layouts = [['template','Original','Original layout'],['one','One','One column layout'],['two','Two','Two columns layout'],['mixed','Mixed','Mixed layout']]

export default function ResumeLayoutCard({ profile, design, onChange, template }) {
  const columns = ['two','mixed'].includes(design.layout)
  function reset() {
    const defaults = getDesign(template?.defaults)
    onChange({ ...design, layout:defaults.layout, headerPosition:'top', columnRatio:50 })
  }
  return <section data-design-group="layout" className="resume-design-card resume-layout-card" aria-labelledby="resume-layout-title">
    <div className="resume-design-card-heading"><h2 id="resume-layout-title">Layout</h2><button type="button" className="design-card-reset" aria-label="Reset layout" title="Reset layout" onClick={reset}><Icon name="undo" className="h-4 w-4" /></button></div>
    <fieldset className="layout-visual-controls"><legend>Columns</legend>
      <div className="layout-column-choices">{layouts.map(([key,label,name]) => <button type="button" key={key} aria-label={name} aria-pressed={design.layout === key} onClick={() => onChange({ ...design, layout:key })}>
        <span aria-hidden="true" className="layout-column-sketch" data-sketch={key}>{Array.from({ length:6 },(_,index) => <i key={index} />)}</span><span>{label}</span>
      </button>)}</div>
    </fieldset>
    {columns && <fieldset className="layout-visual-controls"><legend>Header position</legend>
      <div className="layout-header-choices">{[['top','Top'],['left','Left'],['right','Right']].map(([key,label]) => <button type="button" key={key} aria-label={`Header position: ${label}`} aria-pressed={(design.headerPosition || 'top') === key} onClick={() => onChange({ ...design, headerPosition:key })}>
        <span aria-hidden="true" className="layout-header-sketch" data-position={key}><i /><i /></span><span>{label}</span>
      </button>)}</div>
    </fieldset>}
    <ResumeSectionOrder profile={profile} design={design} onChange={onChange} layout={columns ? design.layout : 'one'} />
    {columns && <fieldset className="layout-visual-controls layout-column-width"><legend>Column width</legend>
      <div className="layout-width-labels"><span>Left {design.columnRatio ?? 50}%</span><span>Right {100 - (design.columnRatio ?? 50)}%</span></div>
      <input type="range" aria-label="Left column width" min="30" max="70" step="5" value={design.columnRatio ?? 50} onChange={(event) => onChange({ ...design, columnRatio:Number(event.target.value) })} />
    </fieldset>}
  </section>
}
