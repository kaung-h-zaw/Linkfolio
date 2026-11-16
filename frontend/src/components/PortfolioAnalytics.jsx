import { useState } from 'react'
import Icon from './Icon'
import Select from './Select'

const number = (value) => Number(value || 0).toLocaleString()

function lastVisit(value, includeYear = false) {
  const date = value ? new Date(value) : null
  if (!date || !Number.isFinite(date.getTime())) return 'No visits yet'
  return date.toLocaleDateString(undefined, {
    month:'short', day:'numeric', ...(includeYear ? { year:'numeric' } : {}),
  })
}

function AnalyticsBarChart({ rows }) {
  const [range, setRange] = useState(7)
  const totals = new Map()
  const localDateKey = (value) => {
    const date = new Date(value)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  for (const row of rows) {
    const history = row.history || []
    for (const entry of history) {
      const current = totals.get(entry.date) || { views:0, clicks:0 }
      current.views += Number(entry.views || 0)
      current.clicks += Number(entry.clicks || 0)
      totals.set(entry.date, current)
    }
    if (!history.length && row.lastViewedAt) {
      const key = localDateKey(row.lastViewedAt)
      const current = totals.get(key) || { views:0, clicks:0 }
      current.views += Number(row.views || 0)
      current.clicks += Number(row.clicks || 0)
      totals.set(key, current)
    }
  }
  const end = new Date()
  end.setHours(0, 0, 0, 0)
  const series = Array.from({ length:range }, (_, index) => {
    const date = new Date(end)
    date.setDate(end.getDate() - (range - 1 - index))
    const key = localDateKey(date)
    return { key, label:date.toLocaleDateString(undefined, { month:'short', day:'numeric' }), ...(totals.get(key) || { views:0, clicks:0 }) }
  })
  const width = 760, height = 210, left = 42, right = 18, top = 22, bottom = 38
  const chartWidth = width - left - right, chartHeight = height - top - bottom
  const max = Math.max(1, ...series.flatMap((point) => [point.views, point.clicks]))
  const step = chartWidth / series.length
  const barWidth = Math.max(2, Math.min(18, (step - 5) / 2))
  const ticks = [...new Set([0, Math.ceil(max / 2), max])]
  const labelEvery = range === 7 ? 1 : range === 30 ? 5 : 15
  return <section className="analytics-line-card" aria-labelledby="analytics-trend-title">
    <div className="analytics-chart-heading">
      <div><h2 id="analytics-trend-title">Past {range} days</h2><p>Daily portfolio views and link clicks.</p></div>
      <div className="analytics-chart-tools">
        <div className="analytics-range-control" role="group" aria-label="Chart date range">{[7,30,90].map((days) => <button type="button" key={days} aria-pressed={range === days} onClick={() => setRange(days)}>{days} days</button>)}</div>
        <div className="analytics-line-legend"><span><i className="views"/>Views</span><span><i className="clicks"/>Link clicks</span></div>
      </div>
    </div>
    <div className="analytics-line-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Bar chart of views and link clicks over the past ${range} days`}>
        {ticks.map((value) => {
          const y = top + chartHeight - value / max * chartHeight
          return <g key={value}><line className="analytics-grid-line" x1={left} x2={width-right} y1={y} y2={y}/><text className="analytics-axis-label" x={left-10} y={y+4} textAnchor="end">{value}</text></g>
        })}
        {series.map((item, index) => {
          const center = left + step * index + step / 2
          const viewsHeight = item.views / max * chartHeight
          const clicksHeight = item.clicks / max * chartHeight
          const displayedViewsHeight = viewsHeight || 2
          const displayedClicksHeight = clicksHeight || 2
          return <g key={item.key}>
            <rect className="analytics-bar analytics-bar-views" x={center-barWidth-1} y={top+chartHeight-displayedViewsHeight} width={barWidth} height={displayedViewsHeight} rx="4"><title>{item.label}: {item.views} views</title></rect>
            <rect className="analytics-bar analytics-bar-clicks" x={center+1} y={top+chartHeight-displayedClicksHeight} width={barWidth} height={displayedClicksHeight} rx="4"><title>{item.label}: {item.clicks} link clicks</title></rect>
            {(index % labelEvery === 0 || index === series.length - 1) && <text className="analytics-axis-label" x={center} y={height-12} textAnchor="middle">{item.label}</text>}
          </g>
        })}
      </svg>
    </div>
  </section>
}

export default function PortfolioAnalytics({ analytics, onRefresh }) {
  const [selected, setSelected] = useState('all')
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const selection = analytics.some((row) => row.id === selected) ? selected : 'all'
  const rows = analytics.filter((row) => selection === 'all' || row.id === selection)
  const views = rows.reduce((total, row) => total + Number(row.views || 0), 0)
  const clicks = rows.reduce((total, row) => total + Number(row.clicks || 0), 0)
  const latestViewedAt = rows.reduce((latest, row) => {
    const value = Date.parse(row.lastViewedAt)
    return Number.isFinite(value) && value > latest ? value : latest
  }, 0)
  const hasVisitorData = views > 0 || clicks > 0 || latestViewedAt > 0

  async function refresh() {
    if (refreshing) return
    setRefreshing(true); setError('')
    try { await onRefresh() } catch (refreshError) { setError(refreshError.message) }
    finally { setRefreshing(false) }
  }

  return <div className="analytics-view analytics-redesign">
    <div className="analytics-control-bar">
      <span className="analytics-period">All-time visitor activity</span>
      <div className="analytics-controls">
        {analytics.length > 0 && <div className="analytics-portfolio-filter"><span>Portfolio</span><Select aria-label="Filter analytics by portfolio" className="analytics-portfolio-select" menuClassName="analytics-filter-menu" value={selection} onChange={event => setSelected(analytics.find(row => String(row.id) === event.target.value)?.id || 'all')}><option value="all">All portfolios</option>{analytics.map(row => <option key={row.id} value={row.id}>{row.name}</option>)}</Select></div>}
        <button type="button" disabled={refreshing} onClick={refresh} className="button button-outline"><Icon name="refresh" className="h-4 w-4"/>{refreshing ? 'Refreshing…' : 'Refresh'}</button>
      </div>
    </div>

    {error && <p role="alert" className="library-notice text-red-700">{error}</p>}

    <div className="analytics-stat-grid refined-stat-grid">{[
      ['Page views', number(views), 'eye'],
      ['Link clicks', number(clicks), 'link'],
      ['Last viewed', latestViewedAt ? lastVisit(latestViewedAt, true) : 'No visits yet', 'calendar'],
    ].map(([label, value, icon]) => <section aria-label={label} className="analytics-summary-card" key={label}><span className="dashboard-icon"><Icon name={icon} /></span><div><h2>{label}</h2><p className={`analytics-summary-number${label === 'Last viewed' ? ' analytics-summary-date' : ''}`}>{value}</p></div></section>)}</div>

    {!hasVisitorData && <section className="analytics-empty-notice" aria-labelledby="analytics-empty-title"><span className="dashboard-icon"><Icon name="eye" /></span><div><h2 id="analytics-empty-title">No visitor data yet</h2><p>Views, link clicks, and the last viewed date will appear after someone opens a public portfolio.</p></div></section>}

    <AnalyticsBarChart rows={rows}/>
  </div>
}
