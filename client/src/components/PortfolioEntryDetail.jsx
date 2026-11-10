import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon'
import SummaryText from './SummaryText'
import { detailImages } from '../lib/portfolioContent'
import { textDocument, summaryText } from '../lib/summary'
import { profileLinkHref } from '../lib/profileLinks'
import { customEntryDates } from '../lib/contentCatalog'

export default function PortfolioEntryDetail({item,settings,publicSlug,onBack,ownerName}) {
  const back=useRef(null),config=settings.detailPages?.[item.key]||{}
  const title=config.title||item.title,subtitle=config.subtitle??item.entry.subtitle,entry=item.entry,images=detailImages(item,settings)
  const content=config.description!==undefined?textDocument(config.description.replace(/\n{2,}/g,'\n')):entry.content||textDocument('')
  useEffect(()=>{back.current?.focus({preventScroll:true});back.current?.scrollIntoView({block:'nearest'});if(publicSlug)document.title=`${title} — ${ownerName||'Portfolio'}`},[title,publicSlug,ownerName])
  const links=[[item.kind==='projects'?'View project':'Open link',config.url??entry.url],['Source code',config.github??entry.github]].filter(([,url])=>profileLinkHref(url))
  const backLabel=<><Icon name="back" className="h-4 w-4"/><span>Back to portfolio</span></>
  return <article className="portfolio-entry-detail">
    <nav className="portfolio-detail-topbar">{publicSlug?<Link ref={back} to={`/p/${encodeURIComponent(publicSlug)}`} className="portfolio-detail-back">{backLabel}</Link>:<button ref={back} type="button" onClick={onBack} className="portfolio-detail-back">{backLabel}</button>}{ownerName&&<span>{ownerName}</span>}</nav>
    <div className="portfolio-detail-intro" data-has-image={Boolean(images.length)}>
      <header className="portfolio-detail-heading"><p className="portfolio-detail-eyebrow">{item.kind==='projects'?'Project':entry.sectionTitle||'Details'}</p><h1 tabIndex={-1}>{title}</h1>{subtitle&&<p className="portfolio-detail-subtitle">{subtitle}</p>}{(customEntryDates(entry)||entry.location)&&<p className="portfolio-detail-meta">{[customEntryDates(entry),entry.location].filter(Boolean).join(' · ')}</p>}{links.length>0&&<div className="portfolio-detail-links">{links.map(([label,url])=><a key={label} href={profileLinkHref(url)} target="_blank" rel="noopener noreferrer"><span>{label}</span><Icon name="external" className="h-4 w-4"/></a>)}</div>}</header>
      {images.length>0&&<figure className="portfolio-detail-gallery portfolio-detail-cover"><img src={images[0]} alt={`${title} — image 1`}/></figure>}
    </div>
    {summaryText(content).trim()&&<section className="portfolio-detail-description"><h2>Overview</h2><SummaryText content={content}/></section>}
    {images.length>1&&<section className="portfolio-detail-more-images"><h2>Gallery</h2><div className="portfolio-detail-gallery">{images.slice(1).map((src,index)=><figure key={src}><img src={src} alt={`${title} — image ${index+2}`} loading="lazy"/></figure>)}</div></section>}
  </article>
}
