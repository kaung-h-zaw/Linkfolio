import { useState } from 'react'
import Icon from './Icon'
import ResumeLibraryCard from './ResumeLibraryCard'
import PortfolioLibraryCard from './PortfolioLibraryCard'

export default function DocumentLibrary({records,portfolio,busy,onCreate,onGenerate,onDelete}) {
  const [filter,setFilter]=useState('all')
  const [message,setMessage]=useState('')
  const kind=portfolio?'portfolio':'resume'
  const filtered=records.filter(record=>!portfolio||filter==='all'||(record.publication?.visibility||'draft')===filter)
    .sort((a,b)=>(Date.parse(b.updatedAt)||0)-(Date.parse(a.updatedAt)||0))
  async function copy(record) {
    const url=`${window.location.origin}/p/${record.publication.slug}`
    try{await navigator.clipboard.writeText(url);setMessage('Portfolio link copied.')}
    catch{setMessage(`Your portfolio link: ${url}`)}
  }
  return <div className="document-library">
    {message&&<p className="library-notice" role="status">{message}</p>}
    {portfolio&&records.length>0&&<div className="library-tools"><label className="library-select">Visibility<select aria-label="Filter portfolios by visibility" value={filter} onChange={event=>setFilter(event.target.value)}><option value="all">All portfolios</option><option value="public">Public</option><option value="private">Private</option><option value="draft">Drafts</option></select></label></div>}
    <section className="library-results" aria-label={`Saved ${kind}s`}><h2 className="sr-only">Saved {kind}s</h2>
      {!filtered.length?<div className="library-empty-state"><span className="dashboard-icon"><Icon name={portfolio?'window':'file'}/></span><h2>{records.length?'No matching documents':portfolio?'No portfolios yet':'No resumes yet'}</h2>{records.length?<button type="button" className="button button-outline" onClick={()=>setFilter('all')}>Clear filters</button>:<button type="button" className="button button-outline" onClick={onCreate}><Icon name="plus" className="h-4 w-4"/>Create your first {kind}</button>}</div>:<div className="resume-library-grid">{filtered.map(record=>portfolio?<PortfolioLibraryCard key={record.id} record={record} busy={busy} onCopy={copy} onDelete={onDelete}/>:<ResumeLibraryCard key={record.id} record={record} busy={busy} onGenerate={onGenerate} onDelete={onDelete}/>)}</div>}
    </section>
  </div>
}
