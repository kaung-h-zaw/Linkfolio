import Icon from '../Icon'
import SliderControl from './SliderControl'
import { getDesign } from '../../lib/resumeDesign'
import { matchesPreset, resumeSpacing } from '../../lib/designPresets'

const sizes = [
  ['fontSize','Body text','Body size',11,18],
  ['nameSize','Full name','Name size',24,80],
  ['titleSize','Professional title','Professional title',11,26],
  ['headingSize','Section headings','Section headings',10,22],
  ['entrySize','Entry headings','Entry headings',11,24],
]
const spacing = [
  ['lineHeight','Line height',1.2,2,0.05,'×'],
  ['entryGap','Space between entries',4,32,1,'px'],
  ['sectionGap','Space between sections',12,36,1,'px'],
  ['marginX','Left & right margins',20,60,1,'px'],
  ['marginY','Top & bottom margins',20,60,1,'px'],
]

export default function ResumeSizeSpacingCards({ design, onChange, template }) {
  const defaults = getDesign(template?.defaults)
  const balanced = resumeSpacing.find((preset) => preset.id === 'balanced').values
  function reset(keys) {
    onChange({ ...design, ...Object.fromEntries(keys.map((key) => [key, defaults[key]])) })
  }
  return <>
    <section data-design-group="type" className="resume-design-card" aria-labelledby="resume-text-size-title">
      <div className="resume-design-card-heading"><h2 id="resume-text-size-title">Text size</h2><button type="button" className="design-card-suggested" aria-label="Use suggested text sizes" aria-pressed={sizes.every(([key]) => design[key] === defaults[key])} onClick={() => reset(sizes.map(([key]) => key))}><Icon name="star" className="h-3 w-3" /><span>Suggested</span></button><button type="button" className="design-card-reset" aria-label="Reset font size" title="Reset text sizes" onClick={() => reset(sizes.map(([key]) => key))}><Icon name="undo" className="h-4 w-4" /></button></div>
      <div className="design-slider-list">{sizes.map(([key,label,ariaLabel,min,max]) => <SliderControl key={key} label={label} ariaLabel={ariaLabel} recommended={defaults[key]} value={design[key]} min={min} max={max} rangeMax={key === 'nameSize' ? 44 : max} formatValue={(value) => `${Number((value * 0.75).toFixed(2))} pt`} onChange={(value) => onChange({ ...design, [key]:value })}>
        {key === 'nameSize' && design.nameSize >= 40 && <div className="larger-name-options"><span>Larger name</span>{[3,6,9,12,15].map((points) => <button type="button" key={points} disabled={design.nameSize + points / 0.75 > max} aria-label={`Increase full name by ${points} points`} onClick={() => onChange({ ...design, nameSize:design.nameSize + points / 0.75 })}>+{points}</button>)}</div>}
      </SliderControl>)}</div>
    </section>
    <section data-design-group="spacing" className="resume-design-card" aria-labelledby="resume-spacing-title">
      <div className="resume-design-card-heading"><h2 id="resume-spacing-title">Spacing</h2><button type="button" className="design-card-suggested" aria-label="Use suggested spacing" aria-pressed={matchesPreset(design,balanced)} onClick={() => onChange({ ...design, ...balanced })}><Icon name="star" className="h-3 w-3" /><span>Suggested</span></button><button type="button" className="design-card-reset" aria-label="Reset spacing" title="Reset spacing" onClick={() => reset(spacing.map(([key]) => key))}><Icon name="undo" className="h-4 w-4" /></button></div>
      <div className="spacing-card-presets" role="group" aria-label="Spacing presets">{resumeSpacing.map((preset) => <button type="button" key={preset.id} aria-label={`${preset.name} spacing`} aria-pressed={matchesPreset(design,preset.values)} onClick={() => onChange({ ...design, ...preset.values })}>{preset.name}</button>)}</div>
      <div className="design-slider-list">{spacing.map(([key,label,min,max,step,unit]) => <SliderControl key={key} label={label} recommended={balanced[key]} value={design[key]} min={min} max={max} step={step} unit={unit} onChange={(value) => onChange({ ...design, [key]:value })} />)}</div>
    </section>
  </>
}
