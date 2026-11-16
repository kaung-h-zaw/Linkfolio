import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Icon from '../components/Icon'
import { Logo } from '../components/Navbar'
import Select from '../components/Select'
import AdminAccountDirectory from '../components/AdminAccountDirectory'
import AdminSettings from '../components/AdminSettings'
import { useAuth } from '../lib/authContext'
import { api } from '../lib/api'
import { isSelectableTemplate, templateNames } from '../lib/templateCatalog'
import './admin.css'

const sections = [['overview','Overview & reports','grid'],['users','User accounts','user'],['templates','Templates','window'],['plans','Subscription plans','spark'],['profile','Admin settings','personal']]
const metrics = {users:['Registered users','user'],resumes:['Resumes','file'],portfolios:['Portfolios','window'],published:['Published portfolios','external'],messages:['Contact messages','mail'],views:['Portfolio views','eye'],paidUpgrades:['Paid upgrades','spark'],documents:['Saved documents','folder']}
const descriptions = {overview:'Review platform activity and manage your workspace.',users:'Find accounts, manage access, and remove users when needed.',templates:'Manage template availability and Premium access.',plans:'Manage document allowances and Premium availability.',reports:'Review current system totals by report type.',profile:'Manage your profile, security, and appearance.'}

function DeleteUserDialog({ account, onClose, onDelete }) {
  const dialog = useRef(null)
  const [email,setEmail] = useState('')
  const [busy,setBusy] = useState(false)
  const [error,setError] = useState('')
  useEffect(() => {
    const element=dialog.current, focus=document.activeElement
    element.showModal()
    return () => {element.close(); if (focus?.isConnected) focus.focus()}
  },[])
  return <dialog ref={dialog} className="admin-delete-dialog" aria-labelledby="admin-delete-heading" onCancel={event => {event.preventDefault(); if (!busy) onClose()}}>
    <h2 id="admin-delete-heading">Delete {account.fullName}?</h2><p>This permanently deletes this user’s account, resumes, portfolios, messages, and related data. This cannot be undone.</p>
    <form onSubmit={async event => {event.preventDefault(); if(busy || email !== account.email) return; setBusy(true);setError('');try {await onDelete(email);onClose()} catch(cause) {setError(cause.message);setBusy(false)}}}>
      <label>Type <strong>{account.email}</strong> to confirm<input autoFocus value={email} onChange={event => setEmail(event.target.value)} autoComplete="off" required /></label>
      {error && <p role="alert">{error}</p>}<div className="admin-dialog-actions"><button type="button" disabled={busy} className="button button-outline" onClick={onClose}>Cancel</button><button className="button button-dark" disabled={busy || email !== account.email}><Icon name="trash" />{busy?'Deleting…':'Delete user'}</button></div>
    </form>
  </dialog>
}

export default function AdminPage() {
  const { user, logout, setUser } = useAuth()
  const [params,setParams] = useSearchParams()
  const section = sections.some(([id]) => id === params.get('section')) ? params.get('section') : 'overview'
  const [data,setData] = useState(null)
  const [error,setError] = useState('')
  const [notice,setNotice] = useState('')
  const [busy,setBusy] = useState(false)
  const [loading,setLoading] = useState(true)
  const [kind,setKind] = useState('resume')
  const [report,setReport] = useState('all')
  const [attempt,setAttempt] = useState(0)
  const [deleting,setDeleting] = useState(null)
  const [updated,setUpdated] = useState(null)
  useEffect(() => {
    const controller=new AbortController()
    api('/admin',{signal:controller.signal}).then(result => {setData(result);setError('');setUpdated(new Date())}).catch(cause => {if(cause.name!=='AbortError')setError(cause.message)}).finally(() => {if(!controller.signal.aborted)setLoading(false)})
    return () => controller.abort()
  },[attempt])
  async function mutate(work,success) {
    setBusy(true);setError('');setNotice('')
    try {await work();setData(await api('/admin'));setUpdated(new Date());setNotice(success)}
    catch(cause) {setError(cause.message);throw cause} finally {setBusy(false)}
  }
  const action=(work,success) => {if(!busy)mutate(work,success).catch(() => {})}
  const navigate=id => {setParams(id==='overview'?{}:{section:id});setNotice('')}
  const refresh=() => {if(!busy&&!loading){setLoading(true);setAttempt(value=>value+1)}}
  const templates=(data?.templates||[]).filter(isSelectableTemplate).filter(template=>template.kind===kind)
  const reportKeys=report==='all'?Object.keys(metrics):report==='accounts'?['users','paidUpgrades']:report==='content'?['resumes','portfolios','documents','published']:['views','messages','published']
  function downloadReport() {
    const rows=reportKeys.flatMap(key=>key==='users' ? [['Registered users',data.report.users??0,updated.toISOString()],['Administrators',data.report.administrators??0,updated.toISOString()]] : [[metrics[key][0],data.report[key]??0,updated.toISOString()]])
    const csv=[['Metric','Total','Generated at'],...rows].map(row=>row.join(',')).join('\r\n')
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'})), link=document.createElement('a')
    link.href=url;link.download=`linkfolio-${report}-report.csv`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)
  }
  return <div className="admin-workspace" data-section={section}>
    <aside className="admin-sidebar"><Logo to="/admin" label="Linkfolio administration" /><span className="admin-sidebar-caption">ADMINISTRATION</span><nav aria-label="Administration">{sections.map(([id,label,icon])=><button type="button" key={id} onClick={()=>navigate(id)} aria-current={section===id?'page':undefined}><Icon name={icon}/><span>{label}</span></button>)}</nav><div className="admin-sidebar-account"><strong>{user.fullName}</strong><small>Administrator</small></div></aside>
    <main className="admin-main"><header className="admin-page-heading"><div><span className="admin-eyebrow">LINKFOLIO ADMIN</span><h1 tabIndex={-1}>{section==='overview'?'Platform overview':sections.find(([id])=>id===section)[1]}</h1><p>{descriptions[section]}</p></div><button type="button" disabled={busy||loading} className="button button-outline" onClick={refresh}><Icon name="refresh"/>{loading?'Refreshing…':'Refresh'}</button></header>
      {error&&<p role="alert" className="admin-notice admin-error">{error}</p>}{notice&&<p role="status" className="admin-notice"><Icon name="check"/>{notice}</p>}{!data&&loading&&<p role="status">Loading administration data…</p>}{!data&&error&&<button type="button" className="button button-outline" onClick={refresh}>Try again</button>}
      {data&&<>
        {section==='overview'&&<>
          <div className="admin-report-toolbar">
            <div><strong>Platform totals</strong><span>All time · Updated {updated?.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'})}</span></div>
            <div className="admin-report-controls"><Select aria-label="Report type" value={report} onChange={event=>setReport(event.target.value)}><option value="all">All metrics</option><option value="usage">Platform activity</option><option value="content">Documents & publishing</option><option value="accounts">Accounts & upgrades</option></Select><button type="button" className="button button-outline" onClick={downloadReport}><Icon name="download"/>Export report</button></div>
          </div>
          <section className="admin-metrics" aria-label="Selected report totals" aria-live="polite">{reportKeys.map(key=><article key={key}><span className="admin-metric-icon"><Icon name={metrics[key][1]}/></span>{key==='users'?<div className="admin-role-totals"><div><span>Users</span><strong>{Number(data.report.users||0).toLocaleString()}</strong></div><div><span>Administrators</span><strong>{Number(data.report.administrators||0).toLocaleString()}</strong></div></div>:<div><span>{metrics[key][0]}</span><strong>{Number(data.report[key]||0).toLocaleString()}</strong></div>}</article>)}</section>
          <div className="admin-overview-grid">
            <section className="admin-panel"><h2>Manage your platform</h2><div className="admin-shortcuts">{sections.slice(1).map(([id,label,icon])=><button type="button" key={id} onClick={()=>navigate(id)}><Icon name={icon}/><span><strong>{label}</strong><small>{descriptions[id]}</small></span><Icon name="arrow"/></button>)}</div></section>
            <section className="admin-panel"><h2>Account overview</h2><div className="admin-role-summary">{[['users','Users'],['administrators','Administrators']].map(([role,label])=><section key={role}><h3>{label}<span>{data.accountSummary?.[role]?.total??0}</span></h3><dl>{[['Active',data.accountSummary?.[role]?.active??0],['Disabled',data.accountSummary?.[role]?.disabled??0],...(role==='users'?[['Premium',data.accountSummary?.users.premium??0],['Free',data.accountSummary?.users.free??0]]:[])].map(([title,count])=><div key={title}><dt>{title}</dt><dd>{count}</dd></div>)}</dl></section>)}</div></section>
          </div>
        </>}
        {section==='users'&&<AdminAccountDirectory accounts={data.users} currentUserId={user.id} busy={busy} onDelete={setDeleting} onStatusChange={account => action(()=>api(`/admin/users/${account.id}`,{method:'PATCH',body:{disabled:!account.disabled}}),account.disabled?'Account enabled.':'Account disabled and sessions ended.')} />}
        {section==='templates'&&<section className="admin-panel admin-template-panel"><div className="admin-panel-heading"><div><h2>{kind==='resume'?'Resume templates':'Portfolio templates'} <span className="admin-badge">{templates.length}</span></h2><p>Manage availability and Premium access.</p></div><div className="admin-tabs" role="group" aria-label="Template type">{['resume','portfolio'].map(type=><button type="button" key={type} aria-pressed={kind===type} onClick={()=>setKind(type)}><Icon name={type==='resume'?'file':'window'}/>{type==='resume'?'Resume':'Portfolio'}{kind===type&&<Icon name="check"/>}</button>)}</div></div><div className="admin-template-grid">{templates.map(template=><form className="admin-template" key={`${template.kind}-${template.id}-${template.name}`} onSubmit={event=>{event.preventDefault();const form=new FormData(event.currentTarget);action(()=>api(`/admin/templates/${template.kind}/${template.id}`,{method:'PATCH',body:{name:form.get('name'),enabled:form.has('enabled'),premium:form.has('premium')}}),'Template settings saved.')}}><div className="admin-template-heading"><span className="admin-metric-icon"><Icon name={kind==='resume'?'file':'window'}/></span><span className={`admin-badge ${template.enabled?'is-active':''}`}>{template.enabled?'Available':'Unavailable'}</span></div><label>Template name<input name="name" required maxLength={120} defaultValue={template.name||templateNames[kind][template.id]}/></label><div className="admin-template-options"><label><input name="enabled" type="checkbox" defaultChecked={Boolean(template.enabled)}/>Available</label><label><input name="premium" type="checkbox" defaultChecked={Boolean(template.premium)}/>Premium only</label></div><button disabled={busy} className="button button-outline"><Icon name="save"/>Save changes</button></form>)}</div></section>}
        {section==='plans'&&<div className="admin-plan-grid">{data.plans.filter(plan=>['free','premium'].includes(plan.id)).map(plan=><section className="admin-panel" key={`${plan.id}-${plan.resume_limit}-${plan.portfolio_limit}-${plan.enabled}`}><div className="admin-panel-heading"><div><span className="admin-eyebrow">{plan.id==='premium'?'PAID MEMBERSHIP':'STARTER MEMBERSHIP'}</span><h2>{plan.name}</h2></div><Icon name={plan.id==='premium'?'spark':'user'}/></div><form className="admin-plan-form" onSubmit={event=>{event.preventDefault();const form=new FormData(event.currentTarget);action(()=>api(`/admin/plans/${plan.id}`,{method:'PATCH',body:{resumeLimit:Number(form.get('resumeLimit')),portfolioLimit:Number(form.get('portfolioLimit')),enabled:plan.id==='free'||form.has('enabled')}}),`${plan.name} settings saved.`)}}>{[['resumeLimit','Resume limit',plan.resume_limit],['portfolioLimit','Portfolio limit',plan.portfolio_limit]].map(([name,label,value])=><label key={name}>{label}<input name={name} type="number" min="1" max="100" required defaultValue={value}/></label>)}{plan.id==='premium'?<label className="admin-check"><input type="checkbox" name="enabled" defaultChecked={Boolean(plan.enabled)}/>Allow Premium upgrades</label>:<p className="admin-muted">Free remains available for new accounts.</p>}<button disabled={busy} className="button button-green"><Icon name="save"/>Save {plan.name} settings</button></form></section>)}</div>}
        {section==='profile'&&<AdminSettings user={user} busy={busy} onSave={fullName=>action(async()=>{const result=await api('/account',{method:'PATCH',body:{fullName}});setUser(result.user)},'Your profile has been updated.')} onLogout={()=>logout()}/>}
      </>}
    </main>
    {deleting&&<DeleteUserDialog account={deleting} onClose={()=>setDeleting(null)} onDelete={email=>mutate(()=>api(`/admin/users/${deleting.id}`,{method:'DELETE',body:{email}}),'User and associated data deleted.')}/>}
  </div>
}
