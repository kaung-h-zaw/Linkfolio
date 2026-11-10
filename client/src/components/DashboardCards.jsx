import { Link } from 'react-router-dom'
import Icon from './Icon'

export default function DashboardCards({ records, analytics, messages, busy, onImportDrafts }) {
  const resumes = records.filter((record) => record.kind !== 'portfolio')
  const portfolios = records.filter((record) => record.kind === 'portfolio' || record.portfolio)
  const unread = messages.filter((message) => message.status === 'unread').length
  const views = analytics.reduce((total, row) => total + row.views, 0)
  const recent = records.flatMap((record) => [
    ...(record.kind !== 'portfolio' ? [{ ...record, documentKind: 'resume' }] : []),
    ...(record.kind === 'portfolio' || record.portfolio ? [{ ...record, documentKind: 'portfolio' }] : []),
  ]).sort((a, b) => (Date.parse(b.updatedAt) || 0) - (Date.parse(a.updatedAt) || 0)).slice(0, 4)
  const stats = [
    ['Resumes', resumes.length, 'file', '/setup'],
    ['Portfolios', portfolios.length, 'window', '/setup?view=portfolio'],
    ['Portfolio views', views, 'eye', '/analytics'],
    ['Unread messages', unread, 'mail', '/messages'],
  ]
  const actions = [
    ['Create resume', 'plus', '/setup?new=1'],
    ['Import resume', 'upload', '/resume/import'],
  ]
  return <div className="dashboard-cards">

    <section className="dashboard-stats" aria-label="Workspace overview">
      {stats.map(([label, number, icon, to]) => <Link key={label} to={to} className="dashboard-stat" aria-label={`${label}: ${number}`}><div className="dashboard-stat-top"><span className="dashboard-icon"><Icon name={icon} /></span><Icon name="arrow" className="dashboard-arrow" /></div><span className="dashboard-stat-number">{number.toLocaleString()}</span><span className="dashboard-stat-label">{label}</span></Link>)}
    </section>
    <div className="dashboard-content-grid">
      <section className="dashboard-panel dashboard-recent" aria-labelledby="recent-work-title"><div className="dashboard-panel-heading"><div><h2 id="recent-work-title">Recent work</h2></div><Link to="/setup" className="dashboard-text-link">View all<Icon name="arrow" /></Link></div>
        {recent.length ? <div className="dashboard-document-grid">{recent.map((record) => {
          const portfolio = record.documentKind === 'portfolio'
          const publication = analytics.find((row) => row.id === record.id)
          const title = record.personal?.fullName || record.name || 'Untitled document'
          return <Link key={`${record.id}-${record.documentKind}`} to={`${portfolio ? '/portfolio/editor' : '/editor'}?resume=${encodeURIComponent(record.id)}`} className="dashboard-document" aria-label={`Open ${portfolio ? 'portfolio' : 'resume'} for ${title}`}><span className="dashboard-recent-icon" aria-hidden="true"><Icon name={portfolio?'window':'file'} className="h-5 w-5"/></span><div className="dashboard-document-info"><div className="dashboard-document-meta"><span>{portfolio ? 'Portfolio' : 'Resume'}</span>{portfolio && <span className={`dashboard-visibility ${publication?.visibility === 'public' ? 'is-public' : ''}`}>{publication?.visibility === 'public' ? 'Public' : 'Private'}</span>}</div><h3>{title}</h3><Icon name="arrow" className="dashboard-recent-arrow"/></div></Link>
        })}</div> : <div className="dashboard-empty"><span className="dashboard-icon"><Icon name="folder" /></span><h3>No saved work yet</h3><p>Create a resume or import one you already have.</p><Link to="/setup" className="button button-green">Create a resume<Icon name="plus" className="h-4 w-4" /></Link></div>}
      </section>
      <div className="dashboard-side-cards">
        <section className="dashboard-panel" aria-labelledby="quick-actions-title"><div className="dashboard-panel-heading"><div><h2 id="quick-actions-title">Quick actions</h2></div></div><div className="dashboard-actions">{actions.map(([label, icon, to]) => <Link key={label} to={to} className="dashboard-action"><span className="dashboard-icon"><Icon name={icon} /></span><span><strong>{label}</strong></span><Icon name="arrow" className="dashboard-arrow" /></Link>)}</div></section>

      </div>
    </div>
    <details className="dashboard-panel dashboard-import"><summary><span className="dashboard-icon"><Icon name="download" /></span><span>Recover older drafts</span><Icon name="down" className="dashboard-arrow" /></summary><div><p>Used an earlier Linkfolio preview? Recover drafts saved in this browser.</p><button disabled={busy} onClick={onImportDrafts} className="button button-outline disabled:opacity-50">{busy ? 'Importing…' : 'Import browser drafts'}</button></div></details>
  </div>
}
