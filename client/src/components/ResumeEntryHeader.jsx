import { profileLinkHref } from '../lib/profileLinks'
export default function ResumeEntryHeader({
  title,
  subtitle,
  url,
  location,
  dates,
  metadataOrder = 'date-location',
  showMetadata = true,
}) {
  const href = profileLinkHref(url)
  return (
    <div className="resume-entry-header">
      <div className="resume-entry-titles">
        {title && <h4 className="text-sm font-semibold">{title}</h4>}
        {subtitle && (
          <p className="resume-entry-subtitle">
            {href ? (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {subtitle}
              </a>
            ) : (
              subtitle
            )}
          </p>
        )}
      </div>
      {showMetadata && <ResumeEntryMetadata dates={dates} location={location} metadataOrder={metadataOrder} />}

    </div>
  )
}

export function ResumeEntryMetadata({ dates, location, metadataOrder = 'date-location', className = '' }) {
  const metadata = [
    { key:'dates',value:dates,className:'resume-entry-dates' },
    { key:'location',value:location,className:'resume-entry-location' },
  ]
  if (metadataOrder === 'location-date') metadata.reverse()
  const filled = metadata.filter((item) => item.value)
  if (!filled.length) return null
  return <div className={`resume-entry-meta ${className}`}>{filled.map((item) => <p key={item.key} className={`${item.className} text-xs text-muted`}>{item.value}</p>)}</div>
}
