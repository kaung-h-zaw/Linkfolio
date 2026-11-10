import { useState } from 'react'
import Icon from '../Icon'
import { getDesign } from '../../lib/resumeDesign'

const colors = [['Ink','#1e293b'],['Forest','#137763'],['Ocean','#245778'],['Slate','#394653'],['Terracotta','#91472f'],['Burgundy','#843b4d'],['Olive','#59632d'],['Sky','#83ccec'],['Mist','#edf3ef'],['White','#ffffff']]
const targets = [['color','Accent'],['pageColor','Page'],['headerColor','Header'],['borderColor','Border']]
const accents = [['accentName','Name'],['accentTitle','Job title'],['accentHeadings','Headings'],['accentDates','Dates'],['accentEntries','Entry titles']]

export default function ResumeColorsCard({ design, onChange, template }) {
  const [target,setTarget] = useState('color')
  const current = design[target] || (target === 'color' ? template?.color || '#137763' : '#ffffff')
  const update = (value) => onChange({ ...design,[target]:value })
  const reset = () => {
    const defaults = getDesign(template?.defaults)
    const keys = [...targets.map(([key])=>key),...accents.map(([key])=>key)]
    onChange({ ...design,...Object.fromEntries(keys.map(key=>[key,defaults[key]])) })
  }
  return <section data-design-group="colors" className="resume-design-card resume-colors-card" aria-labelledby="resume-colors-title">
    <div className="resume-design-card-heading"><h2 id="resume-colors-title">Colors</h2><button type="button" className="design-card-reset" aria-label="Reset colors" title="Reset colors" onClick={reset}><Icon name="undo" className="h-4 w-4" /></button></div>
    <fieldset className="layout-visual-controls"><legend>Choose an area</legend><div className="resume-color-targets">{targets.map(([key,label])=><button key={key} type="button" aria-label={`Color area: ${label}`} aria-pressed={target===key} onClick={()=>setTarget(key)}><span className="resume-color-area-preview" data-color-area={key} aria-hidden="true"><i /></span><span>{label}</span></button>)}</div></fieldset>
    <fieldset className="resume-color-picker"><legend>{targets.find(([key])=>key===target)[1]} color</legend><div className="resume-color-swatches">{colors.map(([name,hex])=><button type="button" key={name} aria-label={name} title={name} aria-pressed={current.toLowerCase()===hex} style={{'--swatch-color':hex}} onClick={()=>update(hex)}><span aria-hidden="true" style={{color:['White','Mist','Sky'].includes(name)?'#1e293b':'white'}}>{current.toLowerCase()===hex && <Icon name="check" className="h-4 w-4" />}</span></button>)}</div>
      <div className="resume-custom-color-row"><label className="resume-native-color"><span className="resume-custom-color-sample" style={{backgroundColor:current}} aria-hidden="true" /><span>Custom color</span><Icon name="down" className="h-4 w-4" /><input type="color" aria-label="Custom color" value={current} onChange={event=>update(event.target.value)} /></label><button type="button" className="resume-color-default" onClick={()=>update(target==='pageColor'?'#ffffff':'')}>{target==='color'?'Use original':'Clear color'}</button></div>
    </fieldset>
    {target==='color' && <fieldset className="resume-accent-targets"><legend>Apply accent to</legend><div>{accents.map(([key,label])=><label key={key}><input type="checkbox" checked={Boolean(design[key])} onChange={event=>onChange({...design,[key]:event.target.checked})} /><span>{label}</span></label>)}</div></fieldset>}
  </section>
}
