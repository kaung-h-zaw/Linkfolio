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
