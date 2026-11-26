import ResumeEntryHeader, { ResumeEntryMetadata } from './ResumeEntryHeader'
import { profileLinkHref } from '../lib/profileLinks'
import { sectionEntryLayout } from '../lib/resumeSectionLayouts'

// Keep the title and body together when metadata occupies its own column.
export default function ResumeEntry({ design, sectionKey, title, subtitle, url, dates, location, children, className = 'mb-4' }) {
  const sectionStyle = design?.sectionStyles?.[sectionKey]
  if (sectionStyle?.titleOrder === 'subtitle-title' && subtitle) {
    const previousTitle = title
    const href = profileLinkHref(url)
    title = href ? <a href={href} target="_blank" rel="noopener noreferrer">{subtitle}</a> : subtitle
    subtitle = previousTitle
    url = undefined
  }
  const sectionLayout = sectionEntryLayout(sectionKey, sectionStyle)
  const layout = sectionLayout ?? design?.entryLayout
  const position = sectionLayout === 'columns' ? 'right' : (design?.metadataPosition ?? 'right')
  const order = design?.metadataOrder || 'date-location'
  const header = { title, subtitle, url, dates, location, metadataOrder:order }
  if (layout !== 'columns') return <div className={`resume-entry ${className}`} data-entry-structure={layout || 'template'}>
    <ResumeEntryHeader {...header} />{children}
  </div>
  const parts = [
    ...(dates ? [{dates}] : []),
    ...(location ? [{location}] : []),
  ]
  if (order === 'location-date') parts.reverse()
  const split = position === 'split'
  return <div className={`resume-entry ${className}`} data-entry-structure="columns" data-entry-position={position} data-has-left={split && parts.length > 0 || undefined} data-has-right={split && parts.length > 1 || undefined}>
    {split && parts[0] && <ResumeEntryMetadata {...parts[0]} className="resume-entry-side resume-entry-side-first" />}
    {!split && position === 'left' && <ResumeEntryMetadata dates={dates} location={location} metadataOrder={order} className="resume-entry-side" />}
    <div className="resume-entry-main"><ResumeEntryHeader {...header} showMetadata={false} />{children}</div>
    {!split && position !== 'left' && <ResumeEntryMetadata dates={dates} location={location} metadataOrder={order} className="resume-entry-side" />}
    {split && parts[1] && <ResumeEntryMetadata {...parts[1]} className="resume-entry-side resume-entry-side-last" />}
  </div>
}
