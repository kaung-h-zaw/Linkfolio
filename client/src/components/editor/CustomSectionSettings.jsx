export default function CustomSectionSettings({ section, onChange }) {
  const format=section.format || 'standard'
  return <section className="mb-4 space-y-5 rounded-md border border-line bg-white p-5">
    <label className="block text-sm font-medium">Section name<input value={section.heading} maxLength={80} onChange={(event)=>onChange({...section,heading:event.target.value})} className="mt-2 min-h-11 w-full rounded border border-line px-3" /></label>
    <div className="flex flex-wrap gap-4">{[['showInResume','Show in resume',true],['showInPortfolio','Show in portfolio',false]].map(([key,label,fallback])=><label key={key} className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={section[key] ?? fallback} onChange={(event)=>onChange({...section,[key]:event.target.checked})} />{label}</label>)}</div>
    <fieldset><legend className="mb-2 text-sm font-medium">Content type</legend><div className="custom-section-type-choices">
      {[['standard','Standard entries'],['skills','Skill groups']].map(([id,title])=><button type="button" key={id} aria-label={`Custom section type: ${title}`} aria-pressed={format===id} onClick={()=>onChange({...section,format:id})}>{title}</button>)}
    </div></fieldset>
  </section>
}
