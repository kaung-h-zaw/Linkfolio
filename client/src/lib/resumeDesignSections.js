import { coreSections } from './contentCatalog'
import { resumeSectionHasContent } from './sectionContent'
import { resumeTemplates } from '../components/resumeTemplates'

export function resumeDesignSections(profile, design) {
  const sections = [
    ...coreSections
      .filter(([key]) => key !== 'personal')
      .map(([key, title]) => ({
        key,
        title: design.sectionStyles?.[key]?.title || profile[key + 'Section']?.heading || title,
      })),
    ...(profile.links?.length ? [{ key: 'links', title: 'Links' }] : []),
    ...(profile.custom || []).map((item) => ({ key: item.id, title: item.title || 'Custom section' })),
    ...(profile.extraContent || []).map((section) => ({
      key: section.type,
      title: section.heading,
    })),
  ].filter((section) => !(profile.removedSections || []).includes(section.key) && resumeSectionHasContent(profile,section.key))
  sections.push(
    ...(design.sectionOrder || [])
      .filter((key) => key.startsWith('break:'))
      .map((key) => ({ key, title: 'Page break' })),
  )
  const originalOrder = sections.map((section) => section.key)
  const displayOrder = design.sectionOrder?.length ? design.sectionOrder : resumeTemplates.find((item) => item.id === profile.templateId)?.sectionOrder || []
  sections.sort((a, b) => {
    const rank = (key) =>
      displayOrder.includes(key)
        ? displayOrder.indexOf(key)
        : 100 + originalOrder.indexOf(key)
    return rank(a.key) - rank(b.key)
  })
  return sections
}
