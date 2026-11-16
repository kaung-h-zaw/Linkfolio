import Select from "../Select"
import { FaBriefcase } from 'react-icons/fa'
import Icon from '../Icon'
import { fonts, getDesign } from '../../lib/resumeDesign'

const headingStyles = [
  ['template','Original'], ['rule','Underline'], ['band','Shaded'], ['short','Short underline'],
  ['accent','Left accent'], ['plain','Plain'], ['double','Double line'], ['overline','Centered lines'],
]

export default function ResumeHeadingFontCards({ design, onChange, template }) {
  const set = (key,value) => onChange({ ...design,[key]:value })
  const headingCase = design.headingCase || (design.capitals ? 'uppercase' : 'capitalize')
  function resetHeadings() {
    const defaults = getDesign(template?.defaults)
    const next = { ...design, ...Object.fromEntries(['headings','headingIcons','capitals'].map((key) => [key,defaults[key]])) }
    delete next.headingCase
    onChange(next)
  }
  function resetFonts() {
    const defaults = getDesign(template?.defaults)
    onChange({ ...design,font:defaults.font,nameFont:defaults.nameFont })
  }
  const fontSelect = (key,label) => <label className="document-setting"><span>{label}</span><span className="document-setting-control">
    <Select aria-label={label} value={design[key]} onChange={(event) => set(key,event.target.value)} style={{fontFamily:design[key] === 'template' ? key === 'nameFont' && design.font !== 'template' ? design.font : template?.font : design[key]}}>
      {Object.entries(fonts).map(([value,title]) => <option key={value} value={value}>{value === 'template' ? key === 'nameFont' ? 'Same as body font' : 'Original' : title}</option>)}
    </Select><Icon name="down" className="h-4 w-4" />
  </span></label>
  return <>
    <section data-design-group="headings" className="resume-design-card resume-headings-card" aria-labelledby="resume-headings-title">
      <div className="resume-design-card-heading"><h2 id="resume-headings-title">Section headings</h2><button type="button" className="design-card-reset" aria-label="Reset section headings" title="Reset section headings" onClick={resetHeadings}><Icon name="undo" className="h-4 w-4" /></button></div>
      <fieldset className="layout-visual-controls"><legend>Style</legend><div className="heading-style-choices">{headingStyles.map(([key,label]) => <button key={key} type="button" aria-label={`Heading style: ${label}`} aria-pressed={design.headings === key} title={label} onClick={() => set('headings',key)}>
        <span className="heading-style-preview" data-heading-style={key} aria-hidden="true"><i /></span><span>{label}</span>
      </button>)}</div></fieldset>
      <fieldset className="layout-visual-controls"><legend>Capitalization</legend><div className="entry-setting-choices">{[['capitalize','Capitalize'],['uppercase','Uppercase']].map(([key,label]) => <button type="button" key={key} aria-label={`Heading capitalization: ${label}`} aria-pressed={headingCase === key} onClick={() => onChange({ ...design,capitals:key === 'uppercase',headingCase:key })}>{label}</button>)}</div></fieldset>
      <fieldset className="layout-visual-controls"><legend>Icons</legend><div className="entry-setting-choices">{[['none','None'],['outline','Outline'],['filled','Filled']].map(([key,label]) => <button key={key} type="button" aria-label={`Heading icons: ${label}`} aria-pressed={design.headingIcons === key} onClick={() => set('headingIcons',key)}>
        {key === 'outline' && <Icon name="briefcase" className="h-4 w-4" />}{key === 'filled' && <FaBriefcase aria-hidden="true" className="h-4 w-4" />}<span>{label}</span>
      </button>)}</div></fieldset>
    </section>
    <section data-design-group="font" className="resume-design-card" aria-labelledby="resume-font-title">
      <div className="resume-design-card-heading"><h2 id="resume-font-title">Font</h2><button type="button" className="design-card-reset" aria-label="Reset fonts" title="Reset fonts" onClick={resetFonts}><Icon name="undo" className="h-4 w-4" /></button></div>
      <div className="document-settings-fields">{fontSelect('font','Body font')}{fontSelect('nameFont','Name font')}</div>
    </section>
  </>
}
