import { useId } from 'react'
import Icon from '../Icon'
import { resumePhotoSource } from '../../lib/resumePhoto'
import { alignHeaderPhoto } from '../../lib/resumeDesign'

export default function ResumeHeaderPhotoCards({ personal, onEditPersonal, design: savedDesign, onChange, template }) {
  const hintId = useId()
  const design = alignHeaderPhoto(savedDesign,template)
  const centered = (design.header === 'template' ? template?.defaults?.header : design.header) === 'center'
  const unavailable=(key,value)=>key === 'photoPosition' && (centered ? value !== 'top' : value === 'top')
  const set=(key,value)=>{if(!unavailable(key,value))onChange(alignHeaderPhoto({...design,[key]:value},template))}
  const photo=resumePhotoSource(personal.photo)
  function choices(legend,key,values,fallback,sketch=false) {
    return <fieldset className="layout-visual-controls"><legend>{legend}</legend><div data-header-choice={key} className={sketch?'entry-structure-choices header-visual-choices':'entry-setting-choices'}>{values.map(([value,label,icon])=>{
      const disabled = unavailable(key,value)
      const description = `Set text alignment to ${value === 'top' ? 'Center' : 'Left'} in Header.`
      const descriptionId = `${hintId}-${key}-${value}`
      const button = <button type="button" aria-label={`${legend}: ${label}`} data-choice-value={value} disabled={disabled} aria-describedby={disabled ? descriptionId : undefined} aria-pressed={(design[key]??fallback)===value} onClick={()=>set(key,value)}>
        {sketch && <span className="entry-structure-sketch header-option-sketch" data-option={value} aria-hidden="true"><i/><i/><i/></span>}
        {!sketch && icon && <Icon name={icon} className="h-4 w-4" />}<span>{label}</span>
      </button>
      return disabled ? <span className="photo-position-hint" key={value} tabIndex={0} role="group" aria-label={`${label} photo position unavailable`} aria-describedby={descriptionId}>
        {button}<span id={descriptionId} role="tooltip" className="photo-position-tooltip"><span aria-hidden="true">ⓘ</span>{description}</span>
      </span> : <span key={value} className="header-choice-available">{button}</span>
    })}</div></fieldset>
  }
  const reset=(keys)=>{const next={...design};keys.forEach(key=>delete next[key]);if(keys.includes('header'))next.header=template?.defaults?.header||'template';onChange(alignHeaderPhoto(next,template))}
  return <>
    <section data-design-group="header" className="resume-design-card resume-header-design-card" aria-labelledby="resume-header-title">
      <div className="resume-design-card-heading"><h2 id="resume-header-title">Header</h2><button type="button" className="design-card-reset" aria-label="Reset header" title="Reset header" onClick={()=>reset(['header','contactArrangement','contactIcons','nameWeight','titleStyle','titlePosition'])}><Icon name="undo" className="h-4 w-4" /></button></div>
      {choices('Text alignment','header',[['template','Original','window'],['left','Left','alignLeft'],['center','Center','alignCenter']],'template',true)}
      {choices('Contact details','contactArrangement',[['template','Original'],['stacked','Stacked'],['inline','Inline'],['columns','Two columns']],'template',true)}
      {choices('Contact icons','contactIcons',[['none','None'],['plain','Plain','link'],['soft','Soft','link'],['outline','Outlined','link']],'none')}
      {choices('Name style','nameWeight',[['template','Original'],['normal','Regular'],['bold','Bold']],'template')}
      {choices('Job title style','titleStyle',[['template','Original'],['normal','Regular'],['italic','Italic']],'template')}
      {choices('Job title position','titlePosition',[['below','Below name'],['inline','Beside name']],'below')}
    </section>
    <section data-design-group="photo" className="resume-design-card resume-photo-design-card" aria-labelledby="resume-photo-title">
      <div className="resume-design-card-heading"><h2 id="resume-photo-title">Photo</h2><button type="button" className="design-card-reset" aria-label="Reset photo design" title="Reset photo design" onClick={()=>reset(['photoShow','photoGrayscale','photoPosition','photoSize','photoShape'])}><Icon name="undo" className="h-4 w-4" /></button></div>
      {photo ? <div className="resume-photo-design-summary"><img src={photo} alt="Your profile photo" /><button type="button" onClick={onEditPersonal}>Change photo<Icon name="arrow" className="h-4 w-4" /></button></div> : <div className="resume-photo-empty"><p>Add a photo in Personal details to style it here.</p><button type="button" onClick={onEditPersonal}><Icon name="user" className="h-4 w-4" />Personal details<Icon name="arrow" className="h-4 w-4" /></button></div>}
      {photo && <>
        <div className="resume-photo-toggles">{[['photoShow','Show photo',true],['photoGrayscale','Grayscale',false]].map(([key,label,fallback])=><label key={key}><input type="checkbox" checked={design[key]??fallback} onChange={event=>set(key,event.target.checked)} /><span>{label}</span></label>)}</div>
        {choices('Photo position','photoPosition',[['left','Left'],['top','Top'],['right','Right']],'right',true)}
        {choices('Photo size','photoSize',[['xs','XS'],['s','S'],['m','M'],['l','L'],['xl','XL']],'m')}
        <fieldset className="layout-visual-controls"><legend>Shape</legend><div className="entry-setting-choices photo-shape-choices">{[['circle','Circle'],['square','Square'],['rounded','Rounded'],['portrait','Portrait']].map(([value,label])=><button type="button" key={value} aria-label={`Photo shape: ${label}`} aria-pressed={(design.photoShape??(template?.reference==='modern-classic'?'square':'circle'))===value} onClick={()=>set('photoShape',value)}><span className="photo-shape-sketch" data-shape={value} aria-hidden="true"/><span>{label}</span></button>)}</div></fieldset>
      </>}
    </section>
  </>
}
