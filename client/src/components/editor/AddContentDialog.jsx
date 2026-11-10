import { useEffect, useRef, useState } from 'react'
import { coreSections, extraSections } from '../../lib/contentCatalog'
import Icon from '../Icon'

export default function AddContentDialog({ added, existing = [], onAdd, onClose }) {
  const dialog = useRef(null)
  const [customOpen,setCustomOpen] = useState(false)
  const [customName,setCustomName] = useState('')
  const [format,setFormat] = useState('standard')
  const [showInResume,setShowInResume]=useState(true)
  const [showInPortfolio,setShowInPortfolio]=useState(false)
  useEffect(() => { dialog.current.showModal() }, [])
  const choices = [
    ...coreSections.filter(([type]) => type !== 'personal'),
    ...extraSections.filter(([type]) => type === 'custom' || existing.includes(type)).map(([type,title,description]) => type === 'custom' ? [type,'Custom section','Name your own section for awards, volunteering, publications or other relevant details.'] : [type,title,description]),
  ].filter(([type]) => type === 'custom' || !added.includes(type))
  return <dialog ref={dialog} onClose={onClose} onClick={(event) => { if (event.target === dialog.current) dialog.current.close() }} aria-labelledby="add-content-title" className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-lg border border-line bg-white p-0 text-ink shadow-xl backdrop:bg-black/30">
    <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-white p-5">
      <div><h2 id="add-content-title" className="text-xl font-semibold">{customOpen?'Custom section':'Add Content'}</h2></div>
      <button autoFocus type="button" aria-label="Close" onClick={() => dialog.current.close()} className="add-content-close"><Icon name="close" className="h-5 w-5"/></button>
    </div>
    {customOpen ? <form className="space-y-4 p-5" onSubmit={(event) => { event.preventDefault(); if (customName.trim()) onAdd('custom',customName.trim(),{showInResume,showInPortfolio,format}) }}>
      <label className="block text-sm font-medium">Section name<input autoFocus required maxLength={80} value={customName} onChange={(event) => setCustomName(event.target.value)} placeholder="e.g. Volunteering or Awards" className="mt-2 min-h-11 w-full rounded border border-line px-3" /></label>
      <div className="flex flex-wrap gap-4"><label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={showInResume} onChange={(event)=>setShowInResume(event.target.checked)} />Show in resume</label><label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={showInPortfolio} onChange={(event)=>setShowInPortfolio(event.target.checked)} />Show in portfolio</label></div>
      <fieldset><legend className="mb-2 text-sm font-semibold">Content type</legend><div className="custom-section-type-choices">{[['standard','Standard entries'],['skills','Skill groups']].map(([value,label])=><button key={value} type="button" aria-label={`Custom section type: ${label}`} aria-pressed={format===value} onClick={()=>setFormat(value)}>{label}</button>)}</div></fieldset>
      <div className="flex gap-3"><button className="button button-green" disabled={!customName.trim()}>Continue<Icon name="arrow" className="ml-2 h-4 w-4"/></button><button type="button" className="button button-outline" onClick={() => setCustomOpen(false)}>Cancel</button></div>
    </form> : <div className="grid gap-3 p-5 sm:grid-cols-2">
      {choices.map(([type,title,description]) => <button key={type} type="button" aria-label={`Add ${title}`} onClick={() => type === 'custom' ? setCustomOpen(true) : onAdd(type)} className="flex min-h-28 flex-col items-start rounded-md border border-line p-4 text-left hover:border-accent hover:bg-sage">
        <span className="text-sm font-medium">{title}</span><span className="mt-2 text-xs leading-5 text-muted">{description}</span><span className="mt-auto pt-3 text-xs font-medium text-accent">Add section</span>
      </button>)}
      {!choices.length && <p className="text-sm leading-6 text-muted sm:col-span-2">All sections are already added. Add more entries inside an existing section.</p>}
    </div>}
  </dialog>
}
