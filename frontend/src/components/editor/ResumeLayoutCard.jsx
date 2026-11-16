import Icon from '../Icon'
import ResumeSectionOrder from './ResumeSectionOrder'
import { getDesign } from '../../lib/resumeDesign'
import { resumeLayout, resumeColumnRatio } from '../../lib/resumeColumns'
import { resumeDesignSections } from '../../lib/resumeDesignSections'

const layouts = [['one','One column','One column layout'],['two','Two columns','Two columns layout'],['mixed','Mixed','Mixed layout']]

export default function ResumeLayoutCard({ profile, design, onChange, template }) {
  const selectedLayout = resumeLayout(design,template)
  const templateColumns = design.layout === 'template' && selectedLayout !== 'one'
  const columns = selectedLayout !== 'one'
  const ratio = resumeColumnRatio(design,template)
  const resizeColumns = value => onChange({...design,columnRatio:Math.max(30,Math.min(70,value))})
  function changeLayout(layout) {
    if (layout === selectedLayout) return
    const sectionColumns = {...design.sectionColumns}
    if (layout === 'two') for (const key of Object.keys(sectionColumns)) { if (sectionColumns[key] === 'full') delete sectionColumns[key] }
    if (layout === 'mixed') {
      const first = resumeDesignSections(profile,design).find(section => !section.key.startsWith('break:'))
      if (first) sectionColumns[first.key] = 'full'
    }
    onChange({...design,layout,sectionColumns})
  }
  function reset() {
    const defaults = getDesign(template?.defaults)
    onChange({ ...design, layout:defaults.layout, headerPosition:'top', columnRatio:resumeColumnRatio(defaults,template), sectionColumns:{} })
  }
  return <section data-design-group="layout" className="resume-design-card resume-layout-card" aria-labelledby="resume-layout-title">
    <div className="resume-design-card-heading"><h2 id="resume-layout-title">Layout</h2><button type="button" className="design-card-reset" aria-label="Reset layout" title="Reset layout" onClick={reset}><Icon name="undo" className="h-4 w-4" /></button></div>
    <fieldset className="layout-visual-controls"><legend>Columns</legend>
      <div className="layout-column-choices">{layouts.map(([key,label,name]) => <button type="button" key={key} aria-label={name} aria-pressed={selectedLayout === key} onClick={() => changeLayout(key)}>
        <span aria-hidden="true" className="layout-column-sketch" data-sketch={key}>{Array.from({ length:6 },(_,index) => <i key={index} />)}</span><span>{label}</span>
      </button>)}</div>
    </fieldset>
    {columns && !templateColumns && <fieldset className="layout-visual-controls"><legend>Header position</legend>
      <div className="layout-header-choices">{[['top','Top'],['left','Left'],['right','Right']].map(([key,label]) => <button type="button" key={key} aria-label={`Header position: ${label}`} aria-pressed={(design.headerPosition || 'top') === key} onClick={() => onChange({ ...design, headerPosition:key })}>
        <span aria-hidden="true" className="layout-header-sketch" data-position={key}><i /><i /></span><span>{label}</span>
      </button>)}</div>
    </fieldset>}
    <ResumeSectionOrder profile={profile} design={design} onChange={onChange} template={template} layout={selectedLayout} />
    {columns && <fieldset className="layout-visual-controls layout-column-width"><legend>Column width</legend>
      <div className="column-width-steppers">{[['Left',ratio],['Right',100-ratio]].map(([label,value]) => <div key={label}><span>{label} column</span><div className="column-width-stepper"><button type="button" aria-label={`Decrease ${label.toLowerCase()} column width`} disabled={label === 'Left' ? ratio <= 30 : ratio >= 70} onClick={() => resizeColumns(ratio + (label === 'Left' ? -5 : 5))}><Icon name="minus" className="h-4 w-4"/></button><output aria-label={`${label} column width`}>{value}%</output><button type="button" aria-label={`Increase ${label.toLowerCase()} column width`} disabled={label === 'Left' ? ratio >= 70 : ratio <= 30} onClick={() => resizeColumns(ratio + (label === 'Left' ? 5 : -5))}><Icon name="plus" className="h-4 w-4"/></button></div></div>)}</div>
    </fieldset>}
  </section>
}
