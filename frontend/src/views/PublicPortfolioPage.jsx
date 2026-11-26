import { portfolioDetailEntries } from '../lib/portfolioContent'
import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../services/api'
import { hydrateProfile } from '../lib/profile'
import PortfolioPreview from '../components/PortfolioPreview'

export default function PublicPortfolioPage() {
  const { slug, detailKind, entryId } = useParams()
  return <PublicPortfolio key={`${slug}-${detailKind || ''}-${entryId || ''}`} slug={slug} detailKey={detailKind && entryId ? `${detailKind}:${entryId}` : undefined} />
}
function PublicPortfolio({ slug, detailKey }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  // Share the request across StrictMode effect replay so one visit counts once.
  const request = useRef(null)
  useEffect(() => {
    let active = true
    request.current ||= api(`/public/portfolios/${encodeURIComponent(slug)}`)
    request.current
      .then((result) => {
        if (active) {
          setData(result)
          document.title = `${result.profile.personal.fullName} — Linkfolio`
        }
      })
      .catch((e) => {
        if (active) setError(e.message)
      })
    return () => {
      active = false
    }
  }, [slug])
  function trackClick(event) {
    if (event.type === 'auxclick' && event.button !== 1) return
    const anchor = event.target.closest?.('a')
    const href = anchor?.getAttribute('href')
    if (!/^(https?:\/\/|mailto:)/i.test(href || '')) return
    api(`/public/portfolios/${encodeURIComponent(slug)}/events`, {
      method: 'POST',
      keepalive: true,
      body: { type: 'click', href },
    }).catch(() => {})
  }
  if (error)
    return (
      <main className="mx-auto max-w-xl p-8">
        <h1 className="text-2xl font-semibold">Portfolio unavailable</h1>
        <p className="my-4">{error}</p>
        <Link to="/" className="text-accent underline">
          Visit Linkfolio
        </Link>
      </main>
    )
  if (!data)
    return (
      <main role="status" className="p-8">
        Loading portfolio…
      </main>
    )
  if(detailKey && !portfolioDetailEntries(hydrateProfile(data.profile),data.settings).some((item)=>item.key===detailKey && data.settings.detailPages?.[item.key]?.enabled)) return <main className="portfolio-detail-unavailable"><h1>Detail page unavailable</h1><Link to={`/p/${encodeURIComponent(slug)}`}>Back to portfolio</Link></main>
  return (
    <main onClickCapture={trackClick} onAuxClickCapture={trackClick}>
      <PortfolioPreview
        profile={hydrateProfile(data.profile)}
        resumeProfile={data.resumeProfile ? hydrateProfile(data.resumeProfile) : undefined}
        settings={data.settings}
        publicSlug={slug}
        detailKey={detailKey}
      />
    </main>
  )
}
