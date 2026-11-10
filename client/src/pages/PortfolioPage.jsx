import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PortfolioPreview from '../components/PortfolioPreview'
import { hydrateProfile } from '../lib/profile'
import { readResumes, loadResumes, refreshResumesOnOpen, subscribeResumes } from '../lib/resumeStorage'
import { resolvePortfolioSource } from '../lib/portfolioSource'
import { defaultPortfolio } from '../lib/portfolio'
export default function PortfolioPage() {
  const [params] = useSearchParams()
  return <SavedPortfolio key={params.toString()} id={params.get('resume')} />
}
function SavedPortfolio({ id }) {
  const [resume,setResume] = useState(null)
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState('')
  useEffect(()=>{
    let active=true
    const sync=()=>{
      if(!active)return
      const documents=readResumes(),saved=documents.find(item=>item.id===id)
      setResume(saved?resolvePortfolioSource(saved,documents):null)
      setLoading(false);setError('')
    }
    const unsubscribe=subscribeResumes(sync)
    const stopRefresh=refreshResumesOnOpen(failure=>{if(active){setError(failure.message);setLoading(false)}})
    return()=>{active=false;unsubscribe();stopRefresh()}
  },[id])
  if(loading)return <main className="mx-auto max-w-xl p-8"><p role="status">Loading portfolio…</p></main>
  if(error)return <main className="mx-auto max-w-xl p-8"><p role="alert">{error}</p><button type="button" className="button button-outline mt-4" onClick={()=>{setLoading(true);loadResumes().catch(failure=>{setError(failure.message);setLoading(false)})}}>Try again</button></main>
  if (!resume)
    return (
      <main className="mx-auto max-w-xl p-8">
        <h1 className="text-2xl font-semibold">Portfolio unavailable</h1>
        <p className="mt-4 text-muted">This portfolio could not be found in your account.</p>
        <Link className="button button-green mt-6" to="/setup?view=portfolio">
          My portfolios
        </Link>
      </main>
    )
  const profile = hydrateProfile(resume)
  return (
    <>
      <div className="owner-preview-toolbar flex flex-wrap items-center justify-between gap-3 border-b border-line bg-paper px-6 py-3 text-xs text-muted">
        <span>Owner preview</span>
        <Link
          className="min-h-9 py-2 font-semibold text-accent"
          to={`/portfolio/editor?resume=${encodeURIComponent(id)}`}
        >
          Edit portfolio
        </Link>
      </div>
      <div className="owner-preview-card mx-auto max-w-7xl">
        <PortfolioPreview profile={profile} settings={resume.portfolio || defaultPortfolio} />
      </div>
    </>
  )
}
