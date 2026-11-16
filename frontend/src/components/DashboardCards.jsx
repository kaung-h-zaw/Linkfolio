import { Link } from 'react-router-dom'
import Icon from './Icon'
import { useMessages } from '../lib/messagesContext'
import './dashboard.css'

export default function DashboardCards({ records, analytics, messages }) {
  const resumes = records.filter((record) => record.kind !== 'portfolio')
  const portfolios = records.filter((record) => record.kind === 'portfolio' || record.portfolio)
  const inbox = useMessages()
  const unread = inbox?.loaded ? inbox.unread : messages.filter((message) => !message.deleted_at && message.status === 'unread').length
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
    ['Create resume', 'plus', '/setup?new=1', 'Start with a template'],
    ['Import resume', 'upload', '/resume/import', 'Bring in your existing resume'],
    ['Manage portfolios', 'window', '/setup?view=portfolio', 'Edit and publish your work'],
  ]
  return <div className="dashboard-cards">

    <section className="dashboard-stats" aria-label="Workspace overview">
      {stats.map(([label, number, icon, to]) => <Link key={label} to={to} className="dashboard-stat" aria-label={`${label}: ${number}`}><span className="dashboard-icon"><Icon name={icon} /></span><div className="dashboard-stat-copy"><span className="dashboard-stat-label">{label}</span><span className="dashboard-stat-number">{label === 'Unread messages' && number > 99 ? '99+' : number.toLocaleString()}</span></div><Icon name="arrow" className="dashboard-arrow" /></Link>)}
    </section>
    <div className="dashboard-content-grid">
      <section className="dashboard-panel dashboard-recent" aria-labelledby="recent-work-title"><div className="dashboard-panel-heading"><div><h2 id="recent-work-title">Continue your work</h2><p>Your recently edited resumes and portfolios.</p></div><Link to="/setup" className="dashboard-text-link">View all<Icon name="arrow" /></Link></div>
        {recent.length ? <div className="dashboard-document-grid">{recent.map((record) => {
          const portfolio = record.documentKind === 'portfolio'
          const publication = analytics.find((row) => row.id === record.id)
          const title = record.personal?.fullName || record.name || 'Untitled document'
          const updated = Date.parse(record.updatedAt)
          return <Link key={`${record.id}-${record.documentKind}`} to={`${portfolio ? '/portfolio/editor' : '/editor'}?resume=${encodeURIComponent(record.id)}`} className="dashboard-document" aria-label={`Open ${portfolio ? 'portfolio' : 'resume'} for ${title}`}><span className="dashboard-recent-icon" aria-hidden="true"><Icon name={portfolio?'window':'file'} className="h-5 w-5"/></span><div className="dashboard-document-info"><div className="dashboard-document-meta"><span>{portfolio ? 'Portfolio' : 'Resume'}</span>{portfolio && <span className={`dashboard-visibility ${publication?.visibility === 'public' ? 'is-public' : ''}`}>{publication?.visibility === 'public' ? 'Public' : 'Private'}</span>}</div><h3>{title}</h3>{Number.isFinite(updated) && <p>Edited {new Date(updated).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</p>}</div><span className="dashboard-document-open">Open<Icon name="arrow" /></span></Link>
        })}</div> : <div className="dashboard-empty"><span className="dashboard-icon"><Icon name="folder" /></span><h3>No saved work yet</h3><p>Create a resume or import one you already have.</p><Link to="/setup" className="button button-green">Create a resume<Icon name="plus" className="h-4 w-4" /></Link></div>}
      </section>
      <div className="dashboard-side-cards">
        <section className="dashboard-panel" aria-labelledby="quick-actions-title"><div className="dashboard-panel-heading"><div><h2 id="quick-actions-title">Quick actions</h2></div></div><div className="dashboard-actions">{actions.map(([label, icon, to, description]) => <Link key={label} to={to} className="dashboard-action"><span className="dashboard-icon"><Icon name={icon} /></span><span><strong>{label}</strong><small>{description}</small></span><Icon name="arrow" className="dashboard-arrow" /></Link>)}</div></section>

      </div>
    </div>
  </div>
}
