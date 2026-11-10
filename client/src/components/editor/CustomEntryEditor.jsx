import { useRef, useState } from 'react'
import SummaryEditor from './SummaryEditor'
import { profileLinkHref } from '../../lib/profileLinks'

export default function CustomEntryEditor({entry,onChange,onDone,onDelete}) {
  const [error,setError]=useState('')
  const [detailsOpen,setDetailsOpen]=useState(()=>Boolean(entry.startDate || entry.endDate || entry.location || entry.url || entry.current))
  const endInput=useRef(null)
  const invalidDates=!entry.current && entry.startDate && entry.endDate && entry.endDate<entry.startDate
  const set=(key,value)=>{setError('');onChange({...entry,[key]:value})}
  const field='mt-2 min-h-11 w-full min-w-0 rounded border border-line bg-paper px-3 text-sm font-normal'
  const done=()=>{
    if(invalidDates){setError('End date must be on or after start date.');endInput.current?.reportValidity();return}
    if(entry.url?.trim() && !profileLinkHref(entry.url)){setError('Enter a valid web address.');return}
    if(entry.startDate && !entry.endDate && !entry.current && entry.dateLabel==='custom' && !entry.customDateLabel?.trim()){setError('Enter a date label.');return}
    onDone()
  }
  return <SummaryEditor entry={entry} onChange={onChange} onDone={done} onDelete={onDelete} title="Edit custom entry" label="Description" autofocus={false}>
    <div className="mb-5 space-y-5">
      <label className="block text-sm font-medium">Title<input autoFocus value={entry.name} maxLength={160} onChange={(event)=>set('name',event.target.value)} placeholder="e.g. Volunteer mentor" className={field} /></label>
      <label className="block text-sm font-medium">Subtitle<input value={entry.subtitle || ''} maxLength={160} onChange={(event)=>set('subtitle',event.target.value)} placeholder="e.g. Organisation or programme" className={field} /></label>
      <details open={detailsOpen} onToggle={(event)=>setDetailsOpen(event.currentTarget.open)} className="design-fine-group"><summary>Dates, location & link (optional)</summary><div className="mt-4 space-y-4">
        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          <label className="min-w-0 text-sm font-medium">Start date<input type="month" value={entry.startDate || ''} onChange={(event)=>set('startDate',event.target.value)} className={field} /></label>
          <label className="min-w-0 text-sm font-medium">End date<input ref={endInput} type="month" disabled={Boolean(entry.current)} min={entry.startDate || undefined} value={entry.current ? '' : entry.endDate || ''} onChange={(event)=>set('endDate',event.target.value)} aria-invalid={Boolean(invalidDates)} className={`${field} disabled:opacity-40`} /></label>
        </div>
        <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={Boolean(entry.current)} onChange={(event)=>set('current',event.target.checked)} />Ongoing</label>
        {!entry.endDate && !entry.current && <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          <label className="min-w-0 text-sm font-medium">Date label<select aria-label="Date label" value={entry.dateLabel || ''} onChange={(event)=>set('dateLabel',event.target.value)} className={field}>
            <option value="">No label</option>{['Issued','Awarded','Completed','Published'].map(label=><option key={label} value={label}>{label}</option>)}<option value="custom">Custom label…</option>
          </select></label>
          {entry.dateLabel==='custom' && <label className="min-w-0 text-sm font-medium">Custom date label<input value={entry.customDateLabel || ''} maxLength={40} onChange={(event)=>set('customDateLabel',event.target.value)} placeholder="e.g. Received" className={field}/></label>}
        </div>}
        <label className="block text-sm font-medium">Location<input value={entry.location || ''} maxLength={160} onChange={(event)=>set('location',event.target.value)} placeholder="City, country or Remote" className={field} /></label>
        <label className="block text-sm font-medium">Title link<input type="text" inputMode="url" value={entry.url || ''} maxLength={2048} onChange={(event)=>set('url',event.target.value)} placeholder="https://example.com" className={field} /></label>
      </div></details>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </div>
  </SummaryEditor>
}
