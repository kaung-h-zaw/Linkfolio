import { isCustomSection, customEntryDates } from '../lib/contentCatalog'
import { summaryAsParagraph } from '../lib/resumeSectionLayouts'
import Icon from './Icon'
import { contactLink } from '../lib/contactLinks'
import { resumePhotoSource } from '../lib/resumePhoto'
import PaginatedDocument from './PaginatedDocument'
import {
  FaBriefcase,
  FaGraduationCap,
  FaAward,
  FaGlobe,
  FaFolder,
  FaFileAlt,
  FaTools,
} from 'react-icons/fa'
import ResumeEntry from './ResumeEntry'
import { Children, cloneElement, useContext } from 'react'
import { PreviewSelectionContext } from '../lib/previewSelection'
import { getDesign, formatResumeDate, alignHeaderPhoto } from '../lib/resumeDesign'
import {
  getProjects,
  getCertifications,
  getLanguages,
  visibleEntries,
} from '../lib/additionalSections'
import { getEducation, getSkills } from '../lib/educationSkills'
import { getExperience } from '../lib/experience'
import SummaryText from './SummaryText'
import { getSummary, summaryText } from '../lib/summary'
import { getProfileLinks, profileLinkHref } from '../lib/profileLinks'

// Empty paragraphs at the edges of pasted custom descriptions should not pad entries.
function customDescription(content) {
  if (!content?.content) return content
  const nodes=[...content.content]
  const empty=node=>node.type==='paragraph' && !(node.content||[]).some(child=>child.type==='text'?child.text?.trim():child.type!=='hardBreak')
  while(nodes.length && empty(nodes[0]))nodes.shift()
  while(nodes.length && empty(nodes.at(-1)))nodes.pop()
  return {...content,content:nodes}
}

function ResumeSection({ title, children, sectionKey, documentDesign, style }) {
  const selectedSection = useContext(PreviewSelectionContext)
  const override = documentDesign?.sectionStyles?.[sectionKey] || {}
  if (override.hidden) return null
  const filled = {
    experience: FaBriefcase,
    education: FaGraduationCap,
    certifications: FaAward,
    languages: FaGlobe,
    projects: FaFolder,
    skills: FaTools,
  }
  const SolidIcon = filled[sectionKey] || FaFileAlt
  return (
    <section data-section={sectionKey} data-design-selected={selectedSection === sectionKey || undefined} className="mt-6" data-section-entry-layout={override.entryLayout} data-content-layout={sectionKey === 'summary' ? undefined : override.contentLayout} style={style}>
      <h3 hidden={Boolean(override.hideHeading)} className="mb-3 border-b border-line pb-2 text-[10px] font-bold uppercase tracking-[0.16em]">
        {documentDesign?.headingIcons === 'outline' && (
          <Icon
            name={sectionKey}
            className="mr-2 inline-block h-[1em] w-[1em]"
          />
        )}
        {documentDesign?.headingIcons === 'filled' && (
          <SolidIcon
            aria-hidden="true"
            className="mr-2 inline-block h-[1em] w-[1em]"
          />
        )}
        {override.title?.trim() || title}
      </h3>
      {children}
    </section>
  )
}
function WebLink({ value, label }) {
  if (!value?.trim()) return null
  // Only render web protocols as clickable URLs, including user-entered bare domains.
  let href
  try {
    const url = new URL(
      /^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value}`,
    )
    if (['http:', 'https:'].includes(url.protocol)) href = url.href
  } catch {
    /* Display incomplete input as text while editing. */
  }
  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="break-all text-accent underline underline-offset-2"
    >
      {label ? `${label}: ` : ''}
      {value}
    </a>
  ) : (
    <span className="break-all">
      {label ? `${label}: ` : ''}
      {value}
    </span>
  )
}
function hasContent(item) {
  return Object.entries(item).some(
    ([key, value]) => key !== 'id' && typeof value === 'string' && value.trim(),
  )
}
export default function ResumePreview({
  profile,
  template = { id: 'classic', color: '#39614b', font: 'serif' },
}) {
  const { personal } = profile
  const design = profile.design || template.defaults
    ? alignHeaderPhoto(getDesign({ ...template.defaults, ...profile.design }),template)
    : undefined
  const photo = (design?.photoShow ?? template.photo) ? resumePhotoSource(personal.photo) : ''
  function contactIcon(name,link) {
    if (!design?.contactIcons || design.contactIcons === 'none') return null
    const service = link ? contactLink(link) : null
    const Glyph = service?.Glyph
    return <span className="resume-contact-icon" data-service={service?.service} aria-hidden="true">{Glyph ? <Glyph className="h-[1em] w-[1em]" /> : <Icon name={name} className="h-[1em] w-[1em]" />}</span>
  }
  const experienceDate = (value) => formatResumeDate(value, design)
  const included = (type) => !(profile.removedSections || []).includes(type)
  function collectionProps(key) {
    const sectionStyle=design?.sectionStyles?.[key]||{}
    const mode=sectionStyle.contentLayout
    const columns=['list','compact','tags'].includes(mode)?1:sectionStyle.columns||(key==='certifications'?1:2)
    return {className:`resume-section-collection grid ${key==='skills'?'resume-skills':''} ${key==='certifications'?'grid-cols-1':'grid-cols-2'} gap-x-6 gap-y-2`,'data-collection-layout':mode,'data-row-spacing':sectionStyle.rowSpacing||'tight','data-row-bullets':mode==='list'&&sectionStyle.rowBullets||undefined,'data-compact-separator':sectionStyle.compactSeparator||'bullet','data-subinfo-style':sectionStyle.subinfoStyle||'dash','data-layout-columns':columns,style:{'--collection-columns':columns}}
  }
  function collectionDetails(key,item,extra) {
    const hasContent=summaryText(item.content).trim()
    if(!item.level&&!hasContent&&!extra)return null
    const inline=['list','compact','tags'].includes(design?.sectionStyles?.[key]?.contentLayout)
    return <div className="resume-collection-subinfo">{item.level && <span className="resume-collection-level">{item.level}</span>}{extra && <span>{extra}</span>}{hasContent && <SummaryText content={inline?summaryAsParagraph(item.content):item.content}/>}</div>
  }
  const projectsSection = getProjects(profile),
    certificationsSection = getCertifications(profile),
    languagesSection = getLanguages(profile)
  const languages = visibleEntries(languagesSection, ['name', 'level'])
  const educationSection = getEducation(profile)
  const skillsSection = getSkills(profile)
  const skills = skillsSection.entries.filter(
    (item) =>
      item.visible && (item.name.trim() || summaryText(item.content).trim()),
  )
  const summary = getSummary(profile)
  const summaryEntries = summary.entries.filter(
    (entry) => entry.visible && summaryText(entry.content).trim(),
  )
  const experienceSection = getExperience(profile)
  const experience = experienceSection.entries.filter(
      (item) =>
        item.visible &&
        (['jobTitle', 'company', 'startDate', 'endDate', 'location'].some(
          (key) => item[key]?.trim(),
        ) ||
          summaryText(item.content).trim()),
    ),
    education = educationSection.entries.filter(
      (item) =>
        item.visible &&
        (['degree', 'school', 'location', 'startDate', 'endDate'].some((key) =>
          item[key].trim(),
        ) ||
          summaryText(item.content).trim()),
    ),
    projects = visibleEntries(projectsSection, [
      'name',
      'subtitle',
      'startDate',
      'endDate',
      'url',
      'github',
    ]),
    certificates = visibleEntries(certificationsSection, [
      'name',
      'issuer',
      'issueDate',
      'expiryDate',
      'url',
    ]),
    links = profile.links.filter((item) => item.url?.trim())
  const custom = (profile.custom || []).filter(hasContent)
  const extras = (profile.extraContent || [])
    .filter((section) => included(section.type) && section.showInResume !== false)
    .map((section) => ({
      ...section,
      entries: visibleEntries(section, isCustomSection(section.type) && section.format !== 'skills' ? ['name','subtitle','location','startDate','endDate'] : ['name']),
    }))
    .filter((section) => section.entries.length)
  const empty =
    !(
      Object.values(personal).some(
        (value) => typeof value === 'string' && value.trim(),
      ) || getProfileLinks(personal).some((link) => link.url.trim())
    ) &&
    !skills.length &&
    !experience.length &&
    !education.length &&
    !projects.length &&
    !certificates.length &&
    !languages.length &&
    !links.length &&
    !custom.length &&
    !extras.length
  return (
    <OrderedDocument
      documentDesign={design}
      footer={{pages:design?.footerPages,email:design?.footerEmail ? personal.email : '',name:design?.footerName ? personal.fullName : ''}}
      order={design?.sectionOrder?.length ? design.sectionOrder : template.sectionOrder || []}
      lang={design?.locale}
      aria-label="Resume document"
      data-template={template.id}
      data-reference={template.reference}
      data-design={design ? 'custom' : undefined}
      data-page-border={design?.borderColor ? 'custom' : 'default'}
      data-columns={design?.layout}
      data-header={design?.header}
      data-header-position={design?.headerPosition || 'top'}
      data-headings={design?.headings}
      data-capitals={design?.capitals}
      data-heading-case={design?.headingCase}
      data-underline={design?.underline}
      data-link-blue={design?.linkBlue}
      data-link-icon={design?.linkIcon ? design.linkIconStyle || 'chain' : undefined}
      data-footer={Boolean(design?.footerPages || (design?.footerEmail && personal.email) || (design?.footerName && personal.fullName))}
      data-entry-layout={design?.entryLayout}
      data-meta-position={design?.metadataPosition}
      data-meta-order={design?.metadataOrder || 'date-location'}
      data-subtitle={design?.subtitlePlacement}
      data-accent-name={design?.accentName}
      data-accent-title={design?.accentTitle}
      data-accent-headings={design?.accentHeadings}
      data-accent-dates={design?.accentDates}
      data-accent-entries={design?.accentEntries}
      style={{
        '--resume-accent': design?.color || template.color,
        '--resume-font':
          design && design.font !== 'template' ? design.font : template.font,
        ...(design
          ? {
              '--design-size': design.fontSize + 'px',
              '--design-name-font':
                design.nameFont === 'template'
                  ? 'var(--resume-font)'
                  : design.nameFont,
              backgroundColor: design.pageColor,
              ...(design.borderColor
                ? { borderColor: design.borderColor, borderWidth: '3px' }
                : {}),
              '--design-header-bg': design.headerColor || 'transparent',
              '--design-name': design.nameSize + 'px',
              '--design-line': design.lineHeight,
              '--design-margin': design.margin + 'px',
              '--design-gap': design.sectionGap + 'px',
              '--design-title': design.titleSize + 'px',
              '--design-heading': design.headingSize + 'px',
              '--design-entry': design.entrySize + 'px',
              '--design-x': design.marginX + 'px',
              '--design-y': design.marginY + 'px',
              '--design-entry-gap': design.entryGap + 'px',
              '--design-left-column': `${design.columnRatio ?? 50}fr`,
              '--design-right-column': `${100 - (design.columnRatio ?? 50)}fr`,
              '--design-ratio':
                design.page === 'Letter' ? '8.5 / 11' : '210 / 297',
            }
          : {}),
      }}
      className="resume-document min-h-[660px] break-words border border-line bg-white p-6 text-xs leading-relaxed shadow-sm sm:p-9"
    >
      <header data-photo={Boolean(photo)} data-contact-arrangement={design?.contactArrangement} data-contact-icons={design?.contactIcons} data-name-weight={design?.nameWeight} data-title-style={design?.titleStyle} data-title-position={design?.titlePosition} data-photo-position={design?.photoPosition} data-photo-size={design?.photoSize} data-photo-shape={design?.photoShape} data-photo-grayscale={design?.photoGrayscale} style={{'--photo-size':({xs:56,s:72,m:88,l:104,xl:120}[design?.photoSize]||88)+'px'}}>
        {photo && <img className="resume-photo" src={photo} alt="Profile portrait" />}
        <h2 className="font-serif text-3xl leading-tight">
          {personal.fullName || 'Your name'}
        </h2>
        <p className="mt-2 text-sm text-accent">
          {personal.headline || 'Your professional headline'}
        </p>
        <div className="resume-contact-details mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted">
          {[[personal.email,'mail'], [personal.phone,'phone'], [personal.location,'location']]
            .filter(([value])=>Boolean(value))
            .map(([value,icon], index) => (
              <span key={index}>{contactIcon(icon)}<span>{value}</span></span>
            ))}
          {getProfileLinks(personal)
            .filter((link) => link.url.trim())
            .map((link) => {
              const href = profileLinkHref(link.url)
              const label = link.label.trim() || link.url.trim()
              return href ? (
                <a
                  key={link.id}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-accent underline underline-offset-2"
                >
                  {contactIcon('link',link)}<span>{label}</span>
                </a>
              ) : (
                <span key={link.id} className="break-all">
                  {contactIcon('link',link)}<span>{label}</span>
                </span>
              )
            })}
        </div>
      </header>
      {included('summary') && summaryEntries.length > 0 && (
        <ResumeSection
          sectionKey="summary"
          title={summary.heading.trim() || 'Summary'}
        >
          <div className="space-y-3">
            {summaryEntries.map((entry) => (
              <SummaryText key={entry.id} content={summaryAsParagraph(entry.content)} />
            ))}
          </div>
        </ResumeSection>
      )}
      {included('experience') && experience.length > 0 && (
        <ResumeSection
          sectionKey="experience"
          title={experienceSection.heading.trim() || 'Professional Experience'}
        >
          {experience.map((item) => (
            <ResumeEntry key={item.id} design={design} sectionKey="experience"
                title={item.jobTitle}
                subtitle={item.company}
                url={item.employerUrl}
                location={item.location}
                dates={[
                  experienceDate(item.startDate),
                  item.current ? 'Present' : experienceDate(item.endDate),
                ]
                  .filter(Boolean)
                  .join(' — ')}
            >
              <div className="mt-2">
                <SummaryText content={item.content} />
              </div>
            </ResumeEntry>
          ))}
        </ResumeSection>
      )}
      {included('education') && education.length > 0 && (
        <ResumeSection
          sectionKey="education"
          title={educationSection.heading.trim() || 'Education'}
        >
          {education.map((item) => (
            <ResumeEntry key={item.id} design={design} sectionKey="education"
                title={item.degree}
                subtitle={item.school}
                url={item.schoolUrl}
                location={item.location}
                dates={[
                  experienceDate(item.startDate),
                  item.current ? 'Present' : experienceDate(item.endDate),
                ]
                  .filter(Boolean)
                  .join(' — ')}
            >
              <div className="mt-2">
                <SummaryText content={item.content} />
              </div>
            </ResumeEntry>
          ))}
        </ResumeSection>
      )}
      {included('skills') && skills.length > 0 && (
        <ResumeSection
          sectionKey="skills"
          title={skillsSection.heading.trim() || 'Skills'}
        >
          <ul {...collectionProps('skills')}>
            {skills.map((item) => (
              <li key={item.id} className="resume-skill min-w-0">
                {item.name.trim() && <h4 className="text-sm font-bold">{item.name}</h4>}
                {collectionDetails('skills',item)}
              </li>
            ))}
          </ul>
        </ResumeSection>
      )}
      {included('projects') && projects.length > 0 && (
        <ResumeSection
          sectionKey="projects"
          title={projectsSection.heading.trim() || 'Projects'}
        >
          {projects.map((item) => (
            <ResumeEntry key={item.id} design={design} sectionKey="projects"
                title={profileLinkHref(item.url) ? <a href={profileLinkHref(item.url)} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{item.name || 'Project'}</a> : item.name || 'Project'}
                subtitle={item.subtitle}
                location={item.location}
                dates={[experienceDate(item.startDate),item.current ? 'Present' : experienceDate(item.endDate)].filter(Boolean).join(' — ')}
            >
              <div className="mt-2">
                <SummaryText content={item.content} />
              </div>
              {item.github && (
                <WebLink value={item.github} label="Repository" />
              )}
            </ResumeEntry>
          ))}
        </ResumeSection>
      )}
      {included('certifications') && certificates.length > 0 && (
        <ResumeSection
          sectionKey="certifications"
          title={certificationsSection.heading.trim() || 'Certifications'}
        >
          <div {...collectionProps('certifications')}>{certificates.map((item) => ['list','compact','tags'].includes(design?.sectionStyles?.certifications?.contentLayout) ? <div key={item.id} className="resume-certification-item">
            <h4 className="text-sm font-semibold">{profileLinkHref(item.url)?<a href={profileLinkHref(item.url)} target="_blank" rel="noopener noreferrer">{item.name}</a>:item.name}</h4>
            {collectionDetails('certifications',item,[item.issuer,item.issueDate?experienceDate(item.issueDate):'',item.noExpiry?'Does not expire':item.expiryDate?experienceDate(item.expiryDate):''].filter(Boolean).join(' · '))}
          </div> : (
            <ResumeEntry key={item.id} design={design} sectionKey="certifications"
                title={profileLinkHref(item.url) ? <a href={profileLinkHref(item.url)} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{item.name || 'Certificate'}</a> : item.name || 'Certificate'}
                subtitle={item.issuer}
                dates={[
                  item.issueDate ? `Issued ${experienceDate(item.issueDate)}` : '',
                  item.noExpiry ? 'Does not expire' : item.expiryDate ? `Expires ${experienceDate(item.expiryDate)}` : '',
                ].filter(Boolean).join(' · ')}
            >
              <div className="mt-2">
                <SummaryText content={item.content} />
              </div>
            </ResumeEntry>
          ))}</div>
        </ResumeSection>
      )}
      {included('languages') && languages.length > 0 && (
        <ResumeSection
          sectionKey="languages"
          title={languagesSection.heading.trim() || 'Languages'}
        >
          <div {...collectionProps('languages')}>
            {languages.map((item) => (
              <div key={item.id} className="min-w-0">
                <h4 className="text-sm font-semibold">{item.name}</h4>
                {collectionDetails('languages',item)}
              </div>
            ))}
          </div>
        </ResumeSection>
      )}
      {links.length > 0 && (
        <ResumeSection sectionKey="links" title="Links">
          <ul className="space-y-1">
            {links.map((item) => (
              <li key={item.id}>
                <WebLink value={item.url} label={item.label} />
              </li>
            ))}
          </ul>
        </ResumeSection>
      )}
      {extras.map((section) => (
        <ResumeSection
          key={section.type}
          sectionKey={section.type}
          title={section.heading.trim() || 'Section'}
        >
          <div {...(isCustomSection(section.type)&&section.format==='skills' ? collectionProps(section.type) : {className:`resume-extra-entries ${design?.sectionStyles?.[section.type]?.contentLayout === 'columns' ? 'grid' : 'space-y-3'}`})}>
          {section.entries.map((entry) => (
            <div key={entry.id} className="min-w-0">
              {isCustomSection(section.type) && section.format !== 'skills' ? <ResumeEntry design={design} sectionKey={section.type} className="min-w-0"
                title={entry.name && (profileLinkHref(entry.url) ? <a href={profileLinkHref(entry.url)} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{entry.name}</a> : entry.name)}
                subtitle={entry.subtitle}
                location={entry.location}
                dates={customEntryDates(entry,experienceDate)}
              ><SummaryText content={customDescription(entry.content)} /></ResumeEntry> : <>{entry.name && <h4 className="text-sm font-bold">{entry.name}</h4>}{isCustomSection(section.type)&&section.format==='skills'?collectionDetails(section.type,entry):<SummaryText content={entry.content} />}</>}
            </div>
          ))}
          </div>
        </ResumeSection>
      ))}
      {custom.map((item) => (
        <ResumeSection
          key={item.id}
          sectionKey={item.id}
          title={item.title?.trim() || 'Custom section'}
        >
          <p className="whitespace-pre-wrap">{item.content}</p>
        </ResumeSection>
      ))}
      {empty && (
        <div className="mt-12 border-t border-line pt-8 text-center text-muted">
          <p className="font-serif text-xl text-ink">Your resume preview</p>
          <p className="mx-auto mt-3 max-w-xs leading-6">
            Open Personal Information to add your details. Changes appear here
            as you type.
          </p>
        </div>
      )}
    </OrderedDocument>
  )
}

function OrderedDocument({ order, children, documentDesign, footer, ...props }) {
  const nodes = Children.toArray(children)
  const sections = nodes.filter((node) => node.type === ResumeSection)
  const byKey = new Map(sections.map((node) => [node.props.sectionKey, node]))
  const sequence = [
    ...order,
    ...sections
      .map((node) => node.props.sectionKey)
      .filter((key) => !order.includes(key)),
  ]
  const embeddedSummary=documentDesign?.sectionStyles?.summary?.summaryInHeader && byKey.get('summary') && !documentDesign?.sectionStyles?.summary?.hidden
    ? cloneElement(byKey.get('summary'),{documentDesign}) : null
  const pages = [nodes.filter((node) => node.type !== ResumeSection).map(node=>embeddedSummary && node.type==='header' ? cloneElement(node,{},node.props.children,embeddedSummary) : node)]
  for (const key of sequence) {
    if (key.startsWith('break:')) pages.push([])
    else if (byKey.has(key) && !(key==='summary' && embeddedSummary) && !documentDesign?.sectionStyles?.[key]?.hidden)
      pages[pages.length - 1].push(
        cloneElement(byKey.get(key), { documentDesign }),
      )
  }
  return <PaginatedDocument pages={pages} documentProps={props} footer={footer} />
}
