import { customEntryDates } from '../lib/contentCatalog'
import { Link } from 'react-router-dom'
import PortfolioEntryDetail from './PortfolioEntryDetail'
import { portfolioCustomSections, portfolioDetailEntries, detailImages } from '../lib/portfolioContent'
import { portfolioDesignStyle, portfolioOrder } from '../lib/portfolioDesign'
import { portfolioImageSource } from '../lib/portfolioImages'
import ContactForm from './ContactForm'
import PortfolioContactLinks from './PortfolioContactLinks'
import ResumeDownloadButton from './ResumeDownloadButton'
import { useContext, useId, useRef, useState } from 'react'
import { PreviewSelectionContext } from '../lib/previewSelection'
import PortfolioHero from './PortfolioHero'
import { getPortfolioTemplate } from '../lib/portfolioTemplates'
import { defaultPortfolio } from '../lib/portfolio'
import { getSummary, summaryText } from '../lib/summary'
import { getProjects, getCertifications, getLanguages, visibleEntries } from '../lib/additionalSections'
import { getExperience, experienceDate } from '../lib/experience'
import { getEducation, getSkills } from '../lib/educationSkills'
import { getProfileLinks, profileLinkHref } from '../lib/profileLinks'
import SummaryText from './SummaryText'
import Icon from './Icon'

export default function PortfolioPreview({
  profile,
  settings = defaultPortfolio,
  publicSlug,
  resumeProfile,
  detailKey,
}) {
  const selectedSection = useContext(PreviewSelectionContext)
  const instance = useId()
  const [previewDetail,setPreviewDetail]=useState('')
  const details=portfolioDetailEntries(profile,settings)
  const activeDetail=details.find((item)=>item.key===(detailKey || previewDetail) && settings.detailPages?.[item.key]?.enabled)
  const customSections=portfolioCustomSections(profile)
  const customEntries=customSections.flatMap((section)=>section.entries)
  function detailLink(kind,entry) {
    const key=`${kind}:${entry.id}`
    if(!settings.detailPages?.[key]?.enabled) return null
    return publicSlug ? <Link to={`/p/${encodeURIComponent(publicSlug)}/${kind}/${encodeURIComponent(entry.id)}`} className="portfolio-button">View details</Link> : <button type="button" className="portfolio-button" onClick={()=>setPreviewDetail(key)}>View details</button>
  }
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const menuButton = useRef(null)
  const target = (key) => publicSlug ? `#${key}` : `#portfolio-${instance}-${key}`
  const template = getPortfolioTemplate(settings.template)
  const design = settings.design || {}
  const order = portfolioOrder(template,design)
  const layout = (key) => {
    const selected = settings.sectionLayouts?.[key]
    if (selected === 'panel') return key === 'about' ? 'reading' : 'simple'
    return selected && selected !== 'template' ? selected : template.layouts[key] || 'template'
  }
  const personal = profile.personal
  const included = (key) => !(profile.removedSections || []).includes(key)
  const about = included('summary')
    ? getSummary(profile).entries.filter(
        (entry) => entry.visible && summaryText(entry.content).trim(),
      )
    : []
  const projects = included('projects')
    ? visibleEntries(getProjects(profile), ['name', 'subtitle', 'url', 'github'])
    : []
  const certifications = included('certifications')
    ? visibleEntries(getCertifications(profile), ['name', 'issuer'])
    : []
  const experience = included('experience')
    ? visibleEntries(getExperience(profile), ['jobTitle', 'company'])
    : []
  const education = included('education')
    ? visibleEntries(getEducation(profile), ['degree', 'school'])
    : []
  const skills = included('skills') ? visibleEntries(getSkills(profile), ['name']) : []
  const languages = included('languages') && settings.languages === true ? visibleEntries(getLanguages(profile),['name']) : []
  const links = getProfileLinks(personal).filter((link) => profileLinkHref(link.url))
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personal.email) ? personal.email : ''
  const sections = [
    ['about', 'About', about],
    ['projects', 'Projects', projects],
    ['experience', 'Experience', experience],
    ['education', 'Education', education],
    ['skills', 'Skills', skills],
    ['certifications', 'Certifications', certifications],
    ['languages','Languages',languages],
    ['custom',customSections[0]?.heading || 'Custom section',customEntries],
  ].filter(([key, , entries]) => settings[key] !== false && entries.length)
  if (settings.contact && (email || links.length || publicSlug))
    sections.push(['contact', 'Contact', []])
  for (const section of sections) section[1] = settings.sectionTitles?.[section[0]]?.trim() || section[1]
  sections.sort((a,b) => order.indexOf(a[0]) - order.indexOf(b[0]))
  const date = customEntryDates
  return (
    <article
      className="portfolio-site"
      data-portfolio-template={template.id}
      data-design-origin={template.original ? 'linkfolio' : 'reference'}
      data-web-source={template.source ? template.id : undefined}
      data-has-projects={settings.projects !== false && projects.length > 0 ? 'true' : 'false'}
      data-custom-font={design.font && design.font !== 'template' ? 'true' : undefined}
      data-custom-palette={design.palette && design.palette !== 'template' ? 'true' : undefined}
      data-custom-accent={design.accentCustom || (design.palette && design.palette !== 'template') ? 'true' : undefined}
      data-custom-body={design.bodySize !== undefined ? 'true' : undefined}
      data-custom-title={design.titleSize !== undefined ? 'true' : undefined}
      data-custom-heading={design.headingSize !== undefined ? 'true' : undefined}
      data-custom-line={design.lineHeight !== undefined ? 'true' : undefined}
      data-custom-space={design.sectionSpace !== undefined ? 'true' : undefined}
      data-custom-gutter={design.gutter !== undefined ? 'true' : undefined}
      data-custom-corners={design.cardRadius !== undefined ? 'true' : undefined}
      data-project-image-corners={design.projectImageRadius !== undefined ? 'true' : undefined}
      data-custom-image-corners={design.imageRadius !== undefined ? 'true' : undefined}
      data-custom-image-fit={design.imageFit}
      data-image-ratio={design.imageRatio}
      data-portrait-shape={design.portraitShape}
      data-portrait-frame={design.portraitFrame}
      data-portrait-effect={design.portraitEffect}
      data-image-frame={design.imageFrame}
      data-image-effect={design.imageEffect}
      data-cover-effect={design.coverEffect}
      data-hero-position={design.heroPosition}
      data-image-position={design.imagePosition}
      data-cover-ratio={design.coverRatio}
      data-portrait-size={design.portraitSize !== undefined ? 'true' : undefined}
      data-project-columns={design.projectColumns}
      data-custom-gap={design.projectGap !== undefined ? 'true' : undefined}
      data-custom-order={design.sectionOrder?.length ? 'true' : undefined}
      aria-label="Portfolio website"
      style={portfolioDesignStyle(settings)}
    >
      {activeDetail ? <PortfolioEntryDetail ownerName={personal.fullName} item={activeDetail} settings={settings} publicSlug={publicSlug} onBack={()=>setPreviewDetail('')} /> : <div className="portfolio-frame">
        <nav
          aria-label="Portfolio navigation"
          className="portfolio-nav"
          data-menu-open={menuOpen}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setMenuOpen(false)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && menuOpen) {
              event.stopPropagation()
              setMenuOpen(false)
              menuButton.current?.focus()
            }
          }}
        >
          <span className="font-semibold">{personal.fullName || 'Your name'}</span>
          {sections.length > 0 && (
            <button
              ref={menuButton}
              type="button"
              className="portfolio-menu-toggle"
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={menuOpen}
              aria-controls={`portfolio-menu-${instance}`}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <Icon name={menuOpen ? 'close' : 'menu'} className="h-5 w-5" />
            </button>
          )}
          {menuOpen && (
            <button
              type="button"
              tabIndex={-1}
              className="portfolio-menu-backdrop"
              aria-label="Dismiss navigation menu"
              onClick={() => {
                setMenuOpen(false)
                menuButton.current?.focus({ preventScroll: true })
              }}
            />
          )}
          <div
            id={`portfolio-menu-${instance}`}
            className="portfolio-nav-links flex flex-wrap gap-4"
          >
            {sections.map(([key, title]) => (
              <a
                key={key}
                href={target(key)}
                aria-current={activeSection === key ? 'location' : undefined}
                onClick={() => {
                  setActiveSection(key)
                  setMenuOpen(false)
                  menuButton.current?.focus({ preventScroll: true })
                }}
              >
                <span className="portfolio-menu-icon" aria-hidden="true">
                  <Icon
                    name={
                      {
                        about: 'user',
                        projects: 'folder',
                        experience: 'briefcase',
                        education: 'education',
                        skills: 'skills',
                        contact: 'mail',
                        certifications: 'file',
                        languages: 'skills',
                      }[key]
                    }
                    className="h-4 w-4"
                  />
                </span>
                {title}
              </a>
            ))}
          </div>
          {settings.resumeDownload && (
            <ResumeDownloadButton
              profile={resumeProfile || profile}
              className="portfolio-nav-download"
            />
          )}
        </nav>
        <div className="portfolio-body">
          <PortfolioHero
            template={template.id}
            personal={personal}
            settings={settings}
            layout={layout('hero')}
            projects={projects}
            email={email}
            target={target}
            skills={skills}
          />
          {sections.map(([key, title, entries], sectionIndex) => (
            <section
              key={key}
              id={target(key).slice(1)}
              className="portfolio-section"
              data-layout={layout(key)}
              data-custom-layout={settings.sectionLayouts?.[key] && settings.sectionLayouts[key] !== 'template' ? 'true' : undefined}
              data-section={key}
              data-design-selected={selectedSection === key || undefined}
            >
              
              <div className="mb-7">
                <p className="portfolio-eyebrow">
                  {key === 'projects'
                    ? 'Selected work'
                    : key === 'skills'
                      ? 'What I bring'
                      : 'My story'}
                </p>
                <h2>{template.id === 'nocturne' && <span className="developer-section-number">{String(sectionIndex + 1).padStart(2,'0')} / </span>}{title}</h2>
              </div>
              {key === 'about' && (
                <div className="max-w-3xl space-y-4">
                  {entries.map((entry) => (
                    <SummaryText key={entry.id} content={entry.content} />
                  ))}
                </div>
              )}
              {key === 'projects' && (
                <div className="portfolio-projects">
                  {entries.map((entry, index) => (
                    <div key={entry.id} className="portfolio-project">
                      {portfolioImageSource(settings.images?.projects?.[entry.id]) && <img className="portfolio-project-image" src={portfolioImageSource(settings.images.projects[entry.id])} alt={`${entry.name || 'Project'} preview`} loading="lazy" />}
                      {['showcase', 'atelier', 'canvas', 'horizon'].includes(template.id) && (
                        <div className="portfolio-project-art" aria-hidden="true">
                          <span>{String(index + 1).padStart(2, '0')}</span>
                          <i />
                          <i />
                        </div>
                      )}
                      <div className="portfolio-project-index mb-8 flex items-center justify-between text-sm text-muted">
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <Icon name="folder" />
                      </div>
                      <h3>{entry.name || 'Project'}</h3>
                      <p className="mt-2 text-sm text-muted">{entry.subtitle}</p>
                      <p className="mt-2 text-xs text-muted">{date(entry)}</p>
                      <div className="mt-4">
                        {settings.detailPages?.[`projects:${entry.id}`]?.enabled ? <p>{summaryText(entry.content).slice(0,240)}{summaryText(entry.content).length>240 ? '…' : ''}</p> : <SummaryText content={entry.content} />}
                      </div>
                      <div className="mt-6 flex flex-wrap gap-4">
                        {detailLink('projects',entry)}
                        {[
                          ['View project', entry.url],
                          ['Source code', entry.github],
                        ]
                          .filter(([, url]) => profileLinkHref(url))
                          .map(([label, url]) => (
                            <a
                              key={label}
                              href={profileLinkHref(url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="portfolio-text-link"
                            >
                              {label} <Icon name="external" className="inline-block h-3.5 w-3.5 align-middle" />
                            </a>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {key === 'custom' && <div className="portfolio-custom-entries">{entries.map((entry)=>{
                const item=details.find((detail)=>detail.key===`custom:${entry.id}`)
                const image=item && settings.detailPages?.[item.key]?.enabled ? detailImages(item,settings)[0] : ''
                return <div key={entry.id} className="portfolio-custom-entry">
                  {image && <img src={image} alt={`${entry.name || 'Entry'} preview`} className="portfolio-project-image" loading="lazy" />}
                  {entry.name && <h3>{entry.name}</h3>}{entry.subtitle && <p className="mt-2">{entry.subtitle}</p>}
                  <div className="mt-3">{settings.detailPages?.[`custom:${entry.id}`]?.enabled ? <p>{summaryText(entry.content).slice(0,240)}{summaryText(entry.content).length>240 ? '…' : ''}</p> : <SummaryText content={entry.content} />}</div>
                  <div className="mt-4 flex flex-wrap gap-3">{detailLink('custom',entry)}{profileLinkHref(entry.url) && <a href={profileLinkHref(entry.url)} target="_blank" rel="noopener noreferrer" className="portfolio-text-link">Open link</a>}</div>
                </div>
              })}</div>}
              {['experience', 'education'].includes(key) && (
                <div className="space-y-7">
                  {entries.map((entry) => (
                    <div key={entry.id} className="portfolio-timeline">
                      <p className="text-xs leading-6 text-muted">{date(entry)}</p>
                      <div>
                        <h3>{key === 'experience' ? entry.jobTitle : entry.degree}</h3>
                        <p className="mt-1 text-sm text-muted">
                          {[entry.company || entry.school, entry.location]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                        <div className="mt-3">
                          <SummaryText content={entry.content} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {key === 'certifications' && (
                <div className="space-y-6">
                  {entries.map((entry) => (
                    <div key={entry.id}>
                      <h3>{entry.name}</h3>
                      <p className="mt-2 text-sm text-muted">
                        {[entry.issuer, experienceDate(entry.issueDate)]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                      <SummaryText content={entry.content} />
                      {profileLinkHref(entry.url) && (
                        <a
                          className="portfolio-text-link mt-3 inline-block"
                          href={profileLinkHref(entry.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View certificate <Icon name="external" className="inline-block h-3.5 w-3.5 align-middle" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {key === 'languages' && <ul className="portfolio-skills" aria-label="Languages">{entries.map((entry) => <li key={entry.id} className="portfolio-skill"><h3>{entry.name}</h3><p className="mt-2 text-sm text-muted">{entry.level}</p><SummaryText content={entry.content} /></li>)}</ul>}
              {key === 'skills' && (
                <ul className="portfolio-skills" aria-label="Skills">
                  {entries.map((entry) => (
                    <li key={entry.id} className="portfolio-skill">
                      <div className="portfolio-skill-heading">
                        <h3>{entry.name}</h3>
                        {entry.level && (
                          <span className="portfolio-skill-level">{entry.level}</span>
                        )}
                      </div>
                      {summaryText(entry.content).trim() && (
                        <div className="portfolio-skill-description">
                          <SummaryText content={entry.content} />
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {key === 'contact' && (
                <div>
                  <p className="mb-5 text-muted">
                    Have a project or an opportunity in mind? Let’s talk.
                  </p>
                  <PortfolioContactLinks email={email} links={links} />
                  {publicSlug && <ContactForm slug={publicSlug} />}
                </div>
              )}
            </section>
          ))}
          <footer className="portfolio-footer">
            © {new Date().getFullYear()} {personal.fullName || 'Your name'}
            <span>Made with Linkfolio{!template.original && template.source && <> · Design adapted from <a href={template.source} target="_blank" rel="noopener noreferrer">{template.reference} ({template.name})</a></>}</span>
          </footer>
        </div>
      </div>}
    </article>
  )
}
