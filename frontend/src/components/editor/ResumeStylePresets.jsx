import { resumeStyles, matchesPreset } from '../../lib/designPresets'
import { getDesign } from '../../lib/resumeDesign'

export default function ResumeStylePresets({ design, template, onChange }) {
  const defaults = getDesign(template?.defaults)
  const keys = [...new Set(resumeStyles.flatMap(preset => Object.keys(preset.values)))]
  const original = Object.fromEntries(keys.map(key => [key, defaults[key]]))
  const options = [{id:'template',name:'Template',description:'Use the template’s original styling.',values:original}, ...resumeStyles]
  return <section className="resume-design-card" aria-labelledby="resume-style-presets-title">
    <div className="resume-design-card-heading"><h2 id="resume-style-presets-title">Style presets</h2></div>
    <p className="mb-4 text-sm text-muted">Change typography and accents while keeping your layout and sections.</p>
    <div className="resume-style-presets" role="group" aria-label="Resume style presets">
      {options.map(option => <button key={option.id} type="button" aria-label={`${option.name} style`} aria-pressed={matchesPreset(design,option.values)} onClick={()=>onChange({...design,...option.values})}>
        <span className="resume-style-sample" aria-hidden="true" style={{fontFamily:option.values.font === 'template' ? template?.font : option.values.font,color:option.values.color || template?.color,background:'#fff',padding:'0 6px',borderRadius:4,boxShadow:'0 0 0 1px #d8dde3'}}>Aa</span>
        <span className="font-semibold">{option.name}</span><span className="text-xs text-muted">{option.description}</span>
      </button>)}
    </div>
  </section>
}
