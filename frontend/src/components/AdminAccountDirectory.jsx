import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon'
import Select from './Select'
import { filterAdminAccounts } from '../lib/adminAccounts'

export default function AdminAccountDirectory({ accounts, currentUserId, busy, onStatusChange, onDelete }) {
  const [role,setRole] = useState('user')
  const [query,setQuery] = useState('')
  const [status,setStatus] = useState('all')
  const visible = filterAdminAccounts(accounts,role,query,status)
  const total = accounts.filter(account => account.role === role).length
  return <section className="admin-panel admin-table-panel admin-account-directory">
    <div className="admin-account-heading"><div><h2>{role === 'user' ? 'Users' : 'Administrators'} <span className="admin-badge">{total}</span></h2><p>{role === 'user' ? 'Manage member access and account status.' : 'Administrator access is protected. Manage your own details in Admin settings.'}</p></div>
      <div className="admin-tabs" role="group" aria-label="Account type">{[['user','Users','user'],['admin','Administrators','skills']].map(([id,label,icon]) => <button key={id} type="button" aria-pressed={role === id} onClick={() => {setRole(id);setQuery('');setStatus('all')}}><Icon name={icon}/>{label}{role === id && <Icon name="check"/>}</button>)}</div>
    </div>
    <div className="admin-account-toolbar"><div className="admin-account-filters"><label className="admin-account-search"><Icon name="search"/><input type="search" aria-label={`Search ${role === 'user' ? 'users' : 'administrators'}`} placeholder="Search by name or email" value={query} onChange={event => setQuery(event.target.value)}/></label><Select aria-label="Filter account status" value={status} onChange={event => setStatus(event.target.value)}><option value="all">All statuses</option><option value="active">Active</option><option value="disabled">Disabled</option></Select></div><span className="admin-account-result" role="status">{visible.length} of {total} {role === 'user' ? 'users' : 'administrators'}</span></div>
    <div className="admin-table-scroll"><table className="admin-account-table"><thead><tr>{['Account',role === 'user' ? 'Membership' : 'Role','Joined','Status','Actions'].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{visible.map(account => <tr key={account.id}>
      <td><div className="admin-account-identity"><span className="admin-account-avatar" aria-hidden="true">{account.fullName.trim().split(/\s+/).slice(0,2).map(part => part[0]).join('').toUpperCase()}</span><div><strong>{account.fullName}{account.id === currentUserId && <span className="admin-account-you">You</span>}</strong><small>{account.email}</small></div></div></td>
      <td>{role === 'user' ? <span className={`admin-membership ${account.plan === 'premium' ? 'is-premium' : ''}`}>{account.plan === 'premium' && <Icon name="spark"/>}{account.plan === 'premium' ? 'Premium' : 'Free'}</span> : <span className="admin-muted">Administrator</span>}</td>
      <td className="admin-account-date">{Number.isFinite(Date.parse(account.createdAt)) ? new Date(account.createdAt).toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'}) : '—'}</td>
      <td><span className={`admin-badge admin-account-status ${account.disabled ? 'is-disabled' : 'is-active'}`}><i aria-hidden="true"/>{account.disabled ? 'Disabled' : 'Active'}</span></td>
      <td>{role === 'user' ? <div className="admin-row-actions"><button type="button" disabled={busy} className="button button-outline" onClick={() => onStatusChange(account)}><Icon name={account.disabled ? 'check' : 'close'}/>{account.disabled ? 'Enable' : 'Disable'}</button><button type="button" disabled={busy} className="button button-outline admin-danger" onClick={() => onDelete(account)}><Icon name="trash"/>Delete</button></div> : account.id === currentUserId ? <Link className="button button-outline" to="/admin?section=profile"><Icon name="edit"/>Edit profile</Link> : <span className="admin-muted">Protected account</span>}</td>
    </tr>)}</tbody></table>{!visible.length && <div className="admin-account-empty"><Icon name="user"/><strong>No {role === 'user' ? 'users' : 'administrators'} found</strong><p>{query || status !== 'all' ? 'Try a different search or status.' : 'Accounts will appear here once they are created.'}</p>{(query || status !== 'all') && <button type="button" className="button button-outline" onClick={() => {setQuery('');setStatus('all')}}>Clear filters</button>}</div>}</div>
  </section>
}
