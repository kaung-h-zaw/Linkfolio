import { Link } from 'react-router-dom'
import Icon from './Icon'
import ResumePreview from './ResumePreview'
import ResumeDownloadButton from './ResumeDownloadButton'
import { hydrateProfile } from '../lib/profile'
import { resumeTemplates } from './resumeTemplates'

export default function ResumeLibraryCard({record,busy,onGenerate,onDelete}) {
  const profile=hydrateProfile(record)
  const template=resumeTemplates.find(item=>item.id===record.templateId)||resumeTemplates[0]
  const href=`/editor?resume=${encodeURIComponent(record.id)}`
  const title=record.name||record.personal?.fullName||'Untitled resume'
  const date=Number.isFinite(Date.parse(record.updatedAt))?new Date(record.updatedAt).toLocaleDateString(undefined,{month:'short',day:'numeric'}):null
  return <article className="library-document-card resume-library-card">
    <Link to={href} className="resume-card-preview" aria-label={`Open ${title}`}>
      <div className="template-thumbnail resume-card-paper"><div aria-hidden="true" inert className="thumbnail-sheet"><ResumePreview profile={profile} template={template}/></div></div>
    </Link>
    <div className="resume-card-details">
      <div className="resume-card-heading"><h2 title={title}><Link to={href}>{title}</Link></h2>
        <details className="resume-card-more" onKeyDown={event=>{if(event.key==='Escape'){event.currentTarget.open=false;event.currentTarget.querySelector('summary').focus()}}}>
          <summary aria-label={`More options for ${title}`} title="More options"><Icon name="more" className="h-5 w-5"/></summary>
          <div className="resume-card-menu">
            <button type="button" disabled={busy} onClick={event=>{event.currentTarget.closest('details').open=false;onGenerate(record)}}><Icon name="window" className="h-4 w-4"/>{record.portfolio?'Edit linked portfolio':'Generate portfolio'}</button>
            <button type="button" disabled={busy} onClick={()=>onDelete(record)} className="resume-card-delete"><Icon name="trash" className="h-4 w-4"/>Delete resume</button>
          </div>
        </details>
      </div>
      <p className="resume-card-date">{date?`Edited ${date}`:'Not saved yet'}</p>
      <div className="resume-card-actions"><Link to={href} className="resume-card-edit"><Icon name="edit" className="h-4 w-4"/>Edit resume</Link><ResumeDownloadButton profile={profile} className="resume-card-download" buttonClassName="resume-card-download-button" label="Download PDF"/></div>
    </div>
  </article>
}
