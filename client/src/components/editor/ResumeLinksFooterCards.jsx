import Icon from '../Icon'

export default function ResumeLinksFooterCards({design,onChange}) {
  const set=(key,value)=>onChange({...design,[key]:value})
  const toggle=(key,label)=><label className="resume-simple-toggle"><input type="checkbox" checked={Boolean(design[key])} onChange={event=>set(key,event.target.checked)}/><span>{label}</span></label>
  const reset=(keys)=>{const next={...design};keys.forEach(key=>delete next[key]);if(keys.includes('underline'))next.underline=true;onChange(next)}
  return <>
    <section data-design-group="links" className="resume-design-card resume-links-card" aria-labelledby="resume-links-title">
      <div className="resume-design-card-heading"><h2 id="resume-links-title">Links</h2><button type="button" className="design-card-reset" aria-label="Reset links" title="Reset links" onClick={()=>reset(['underline','linkBlue','linkIcon','linkIconStyle'])}><Icon name="undo" className="h-4 w-4"/></button></div>
      <div className="resume-simple-toggles">{toggle('underline','Underline')}{toggle('linkBlue','Blue color')}{toggle('linkIcon','Link icon')}</div>
      {design.linkIcon && <div className="entry-setting-choices resume-link-icon-choices">{[['chain','Link','link'],['external','External link','external']].map(([value,label,icon])=><button type="button" key={value} aria-label={`Link icon style: ${label}`} aria-pressed={(design.linkIconStyle||'chain')===value} onClick={()=>set('linkIconStyle',value)}><Icon name={icon} className="h-5 w-5"/></button>)}</div>}
    </section>
    <section data-design-group="footer" className="resume-design-card" aria-labelledby="resume-footer-title">
      <div className="resume-design-card-heading"><h2 id="resume-footer-title">Footer</h2><button type="button" className="design-card-reset" aria-label="Reset footer" title="Reset footer" onClick={()=>reset(['footerPages','footerEmail','footerName'])}><Icon name="undo" className="h-4 w-4"/></button></div>
      <div className="resume-simple-toggles">{toggle('footerPages','Page numbers')}{toggle('footerEmail','Email')}{toggle('footerName','Name')}</div>
    </section>
  </>
}
