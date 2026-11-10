import {resolvePortfolioSource} from '../lib/portfolioSource'
import {readResumes} from '../lib/resumeStorage'
import { Link } from 'react-router-dom'
import Icon from './Icon'
import PortfolioPreview from './PortfolioPreview'
import { hydrateProfile } from '../lib/profile'
import { defaultPortfolio } from '../lib/portfolio'

export default function PortfolioLibraryCard({record,busy,onCopy,onDelete}) {
  const profile=hydrateProfile(resolvePortfolioSource(record,readResumes()))
  const title=record.kind!=='portfolio'?`${record.personal?.fullName||record.name||'My'} — Portfolio`:record.name||'Untitled portfolio'
  const href=`/portfolio/editor?resume=${encodeURIComponent(record.id)}`
  const share=`/portfolio/editor/share?resume=${encodeURIComponent(record.id)}`
  const visibility=record.publication?.visibility||'draft'
  const live=visibility==='public'&&record.publication?.slug
  return <article className="library-document-card library-wide-card resume-library-card portfolio-library-card">
    <Link to={href} className="resume-card-preview" aria-label={`Edit portfolio for ${record.personal?.fullName||record.name}`}>
      <div className="library-website-preview"><span className="library-browser-bar" aria-hidden="true"><i/><i/><i/></span><svg aria-hidden="true" viewBox="0 0 1000 760" className="block w-full"><foreignObject width="1000" height="6000"><div xmlns="http://www.w3.org/1999/xhtml" inert><PortfolioPreview profile={profile} settings={{...defaultPortfolio,...record.portfolio}}/></div></foreignObject></svg></div>
    </Link>
    <div className="resume-card-details">
      <div className="resume-card-heading"><h2 title={title}><Link to={href}>{title}</Link></h2>
        <details className="resume-card-more library-more" onKeyDown={event=>{if(event.key==='Escape'){event.currentTarget.open=false;event.currentTarget.querySelector('summary').focus()}}}>
          <summary aria-label={`More options for ${record.name||'untitled portfolio'}`} title="More options"><Icon name="more" className="h-5 w-5"/></summary>
          <div className="resume-card-menu">
            {live&&<button type="button" onClick={()=>onCopy(record)}><Icon name="link" className="h-4 w-4"/>Copy link</button>}
            <Link to={`/portfolio/editor/design?resume=${encodeURIComponent(record.id)}`}><Icon name="edit" className="h-4 w-4"/>Customize design</Link>
            {live&&<Link to={share}><Icon name="upload" className="h-4 w-4"/>Publish & share</Link>}
            <button type="button" disabled={busy} onClick={()=>onDelete(record)} className="resume-card-delete"><Icon name="trash" className="h-4 w-4"/>Delete portfolio</button>
          </div>
        </details>
      </div>
      <span className={`library-status status-${visibility}`}>{visibility[0].toUpperCase()+visibility.slice(1)}</span>
      <div className="resume-card-actions"><Link to={href} className="resume-card-edit"><Icon name="edit" className="h-4 w-4"/>Edit portfolio</Link>{live?<a href={`/p/${record.publication.slug}`} target="_blank" rel="noopener noreferrer" className="portfolio-card-publish">View live<Icon name="external" className="h-4 w-4"/></a>:<Link to={share} className="portfolio-card-publish">Publish & share<Icon name="upload" className="h-4 w-4"/></Link>}</div>
    </div>
  </article>
}
