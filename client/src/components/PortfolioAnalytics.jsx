import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon'

const number = (value) => Number(value || 0).toLocaleString()
function lastVisit(value) {
  if (!value || !Number.isFinite(Date.parse(value))) return 'No visits yet'
  return new Date(value).toLocaleDateString(undefined, { month:'short',day:'numeric' })
}
export default function PortfolioAnalytics({ analytics, onRefresh }) {
  const [selected, setSelected] = useState('all')
  const [visibility, setVisibility] = useState('all')
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const selection = analytics.some((row) => row.id === selected) ? selected : 'all'
  const rows = analytics.filter((row) => (selection === 'all' || row.id === selection) && (visibility === 'all' || (row.visibility || 'draft') === visibility))
  const views = rows.reduce((total,row) => total + Number(row.views || 0),0)
  const clicks = rows.reduce((total,row) => total + Number(row.clicks || 0),0)
  const publicCount = rows.filter((row) => row.visibility === 'public').length
  const maxCount = Math.max(1,...rows.map((row) => Math.max(Number(row.views || 0),Number(row.clicks || 0))))
  async function refresh() {
    if (refreshing) return
    setRefreshing(true); setError('')
    try { await onRefresh() } catch(error) { setError(error.message) }
    finally { setRefreshing(false) }
  }
  return <div className="analytics-view analytics-redesign">
    <div className="workspace-toolbar-card analytics-control-bar"><span className="analytics-period">All-time activity</span><div className="analytics-controls">{analytics.length > 0 && <label className="library-select">Portfolio<select aria-label="Filter analytics by portfolio" value={selection} onChange={(event) => setSelected(event.target.value)}><option value="all">All portfolios</option>{analytics.map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}</select></label>}<button type="button" disabled={refreshing} onClick={refresh} className="button button-outline"><Icon name="refresh" className="h-4 w-4"/>{refreshing ? 'Refreshing…' : 'Refresh analytics'}</button></div></div>
    {error && <p role="alert" className="library-notice text-red-700">{error}</p>}
    <div className="analytics-stat-grid refined-stat-grid">{[
      ['Page views',views,'eye'],
      ['Link clicks',clicks,'link'],
      ['Public portfolios',publicCount,'languages'],
    ].map(([label,value,icon]) => <section aria-label={label} className="analytics-summary-card" key={label}><span className="dashboard-icon"><Icon name={icon} /></span><div><h3>{label}</h3><p className="analytics-summary-number">{number(value)}</p></div></section>)}</div>
    <details className="analytics-chart-card analytics-comparison-details"><summary><span>Compare portfolios</span><Icon name="down" className="h-4 w-4"/></summary>
      {rows.some((row) => row.views || row.clicks) ? <><div className="analytics-chart-legend"><span><i />Page views</span><span><i />Link clicks</span></div><div className="analytics-comparison">{rows.map((row) => <div className="analytics-chart-row" key={row.id}><h3>{row.name}</h3><div className="analytics-bar-row"><span>Views</span><div><i style={{ width:`${Number(row.views || 0)/maxCount*100}%` }} /></div><strong>{number(row.views)}</strong></div><div className="analytics-bar-row clicks-bar"><span>Clicks</span><div><i style={{ width:`${Number(row.clicks || 0)/maxCount*100}%` }} /></div><strong>{number(row.clicks)}</strong></div></div>)}</div></> : <div className="analytics-no-activity"><Icon name="eye" className="h-7 w-7" /><h3>No activity recorded yet</h3><p>Views and clicks will appear after visitors open a published portfolio.</p></div>}
    </details>
    <section className="analytics-performance"><div className="analytics-section-heading"><div><h2>Portfolio performance</h2></div><span>{rows.length} {rows.length === 1 ? 'portfolio' : 'portfolios'}</span></div>
      {analytics.length > 0 && <div className="analytics-visibility-filters" role="group" aria-label="Filter analytics by visibility">{[['all','All'],['public','Public'],['private','Private'],['draft','Drafts']].map(([value,label]) => <button type="button" key={value} aria-pressed={visibility === value} onClick={() => setVisibility(value)}>{label}</button>)}</div>}
      {!rows.length ? <div className="library-empty-state"><span className="dashboard-icon"><Icon name="eye" /></span><h3>{analytics.length ? 'No portfolios match this filter' : 'No portfolios yet'}</h3><p>{analytics.length ? 'Choose another visibility filter to see your portfolios.' : 'Create and publish a portfolio to see its views and link clicks here.'}</p>{analytics.length ? <button className="button button-outline" onClick={() => { setVisibility('all'); setSelected('all') }}>Clear filters</button> : <Link to="/setup?view=portfolio" className="button button-green">Go to portfolios<Icon name="arrow" className="h-4 w-4" /></Link>}</div> : <div className="analytics-portfolio-grid">{rows.map((row) => <article key={row.id} aria-label={`Analytics for ${row.name}`} className="analytics-portfolio-card refined-performance-card"><div className="analytics-portfolio-identity"><span className="dashboard-icon"><Icon name="window" /></span><div><h3>{row.name}</h3><span className={`library-status status-${row.visibility || 'draft'}`}>{row.visibility === 'public' ? 'Public' : row.visibility === 'private' ? 'Private' : 'Draft'}</span></div></div><dl className="analytics-portfolio-numbers"><div><dt>Page views</dt><dd>{number(row.views)}</dd></div><div><dt>Link clicks</dt><dd>{number(row.clicks)}</dd></div><div><dt>Last viewed</dt><dd className="analytics-date" title={row.lastViewedAt?new Date(row.lastViewedAt).toLocaleString():undefined}>{lastVisit(row.lastViewedAt)}</dd></div></dl><div className="analytics-portfolio-actions"><Link to={row.visibility === 'public' ? `/p/${row.slug}` : `/portfolio/editor?resume=${encodeURIComponent(row.id)}`} target={row.visibility === 'public' ? '_blank' : undefined} rel={row.visibility === 'public' ? 'noopener noreferrer' : undefined} className="button button-outline">{row.visibility === 'public' ? 'Open portfolio' : 'Edit portfolio'}<Icon name="arrow" className="h-4 w-4" /></Link>{row.visibility === 'public' && <Link to={`/portfolio/editor?resume=${encodeURIComponent(row.id)}`} className="dashboard-text-link">Manage portfolio</Link>}</div></article>)}</div>}
    </section>
    <details className="analytics-counting-note"><summary>How these numbers are counted</summary><p>Page views count public page loads, including your own visits. Link clicks count interactions with portfolio links. These are all-time totals, not unique visitors. Private and unpublished portfolios keep their earlier counts. The comparison shows totals, not a daily activity history.</p></details>
  </div>
}
