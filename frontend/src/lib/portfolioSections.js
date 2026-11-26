import { isExtraSection } from './contentCatalog.js'

export const portfolioSectionDesigns = [
  {
    key: 'hero',
    title: 'Introduction',
    options: [
      ['portrait-left', 'Portrait focus'],
      ['centered', 'Centered'],
      ['split', 'Split introduction'],
    ],
  },
  {
    key: 'about',
    title: 'About',
    options: [
      ['reading', 'Reading column'],
      ['split', 'Title beside text'],

    ],
  },
  {
    key: 'projects',
    title: 'Projects',
    options: [
      ['cards', 'Card grid'],
      ['list', 'Project list'],
      ['feature', 'Featured first'],
    ],
  },
  {
    key: 'experience',
    title: 'Experience',
    options: [
      ['timeline', 'Timeline'],
      ['cards', 'Cards'],
      ['compact', 'Compact list'],
    ],
  },
  {
    key: 'education',
    title: 'Education',
    options: [
      ['timeline', 'Timeline'],
      ['cards', 'Cards'],
      ['compact', 'Compact list'],
    ],
  },
  {
    key: 'skills',
    title: 'Skills',
    options: [
      ['grid', 'Grid'],
      ['cards', 'Cards'],
      ['list', 'Simple list'],
    ],
  },
  { key:'certifications',title:'Certifications',options:[['list','Simple list'],['cards','Cards']] },
  {key:'custom',title:'Custom section',options:[['list','List'],['grid','Two columns'],['cards','Cards'],['timeline','Timeline'],['compact','Compact']]},
  { key:'languages',title:'Languages',options:[['list','Simple list'],['cards','Cards']] },
  {
    key: 'contact',
    title: 'Contact',
    options: [
      ['simple', 'Simple'],
      ['form-first', 'Form first'],

    ],
  },
]

export function portfolioLayoutOverride(settings, key, hasCustomSection) {
  const layout = settings.sectionLayouts?.[key] ?? (isExtraSection(key) && !hasCustomSection ? settings.sectionLayouts?.custom : undefined)
  if (key === 'hero' && layout === 'left') return 'portrait-left'
  if (key === 'contact' && layout === 'centered') return 'form-first'
  if (layout === 'panel') return key === 'about' ? 'reading' : 'simple'
  return layout === 'template' ? undefined : layout
}

export function allowsProjectColumns(layout) {
  return layout !== 'list' && layout !== 'feature'
}

export function validSectionLayouts(value) {
  return (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.entries(value).every(([key, layout]) => {
      const section = portfolioSectionDesigns.find((section) => section.key === key) || (isExtraSection(key) ? portfolioSectionDesigns.find((section) => section.key === 'custom') : undefined)
      return (
        section &&
        (layout === 'template' || (key === 'hero' && layout === 'left') || (key === 'contact' && layout === 'centered') || (layout === 'panel' && ['about','contact'].includes(key)) || section.options.some(([id]) => id === layout))
      )
    })
  )
}
