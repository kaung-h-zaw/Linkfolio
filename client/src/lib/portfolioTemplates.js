import { portfolioTemplateIds } from './templateCatalog.js'

// Shared by the picker, renderer, and saved-portfolio validation.
const legacyPortfolioTemplates = [
  { id: 'essential', name: 'Essential', category: 'Clean', description: 'A familiar, accessible website with simple navigation and cards.', layouts: {} },
  { id: 'editorial', name: 'Editorial', category: 'Editorial', description: 'A magazine masthead, dramatic serif headlines, and column layouts.', layouts: {} },
  { id: 'showcase', name: 'Showcase', category: 'Creative', description: 'An immersive dark gallery with abstract covers and oversized work.', projectsFirst: true, layouts: {} },
  { id: 'studio', name: 'Studio', category: 'Creative', description: 'A bold studio poster with giant typography and a discipline strip.', projectsFirst: true, layouts: { projects: 'feature', about: 'split' } },
  { id: 'canvas', name: 'Canvas', category: 'Creative', description: 'A colorful collage of paper cards, geometric art, and offset shadows.', projectsFirst: true, layouts: { contact: 'panel' } },
  { id: 'atelier', name: 'Atelier', category: 'Creative', description: 'An artful split composition with sculptural arches and warm serif type.', projectsFirst: true, layouts: { projects: 'feature', contact: 'centered' } },
  { id: 'mono', name: 'Mono', category: 'Clean', description: 'A dark terminal interface with command prompts and a project index.', layouts: { projects: 'list', experience: 'compact', education: 'compact' } },
  { id: 'gridfolio', name: 'Gridfolio', category: 'Professional', description: 'A grid of distinct panels for your introduction, projects, and experience.', projectsFirst: true, layouts: { experience: 'cards', education: 'cards', skills: 'cards' } },
  { id: 'journal', name: 'Journal', category: 'Editorial', description: 'A handwritten-style introduction on a quiet, ruled notebook page.', layouts: { about: 'reading', projects: 'list', experience: 'compact', education: 'compact' } },
  { id: 'executive', name: 'Executive', category: 'Professional', description: 'A dark navigation sidebar beside a focused professional profile.', layouts: { experience: 'timeline', education: 'timeline', contact: 'panel' } },
  { id: 'outline', name: 'Outline', category: 'Clean', description: 'A minimal directory with a slim navigation rail and compact work lists.', layouts: { projects: 'list', experience: 'compact', education: 'compact', skills: 'list' } },
  { id: 'horizon', name: 'Horizon', category: 'Professional', description: 'An airy landscape composition with orbital artwork and rounded panels.', layouts: { experience: 'timeline', contact: 'centered' } },
]

// Keep stable IDs so existing portfolios and template access settings remain valid.
const currentPortfolioTemplates = [
  { id:'miniport', name:'Minimal', original:true, category:'Clean', source:'https://html5up.net/miniport', description:'Simple sections, clean typography, and quiet details that let your work speak.', colors:{accent:'#2862d7',background:'#ffffff',text:'#19325b',surface:'#f4f7fc'}, layouts:{projects:'list',skills:'list'} },
  { id:'nocturne', name:'Developer', original:true, category:'Professional', source:'https://brittanychiang.com', description:'A dark developer workspace with numbered sections, skill cards, and project cards.', colors:{accent:'#d8ec79',background:'#181b1d',text:'#f2f1e8',surface:'#22272a'}, projectsFirst:true, layouts:{projects:'grid',skills:'cards'} },
  { id:'multiverse', name:'Creative', original:true, category:'Creative', source:'https://html5up.net/multiverse', description:'Large images, expressive typography, and colourful, asymmetric work layouts.', colors:{accent:'#9055be',background:'#fff8f2',text:'#372944',surface:'#f3e7fa'}, projectsFirst:true, layouts:{} },
  { id:'freelancer', name:'Professional', original:true, category:'Professional', source:'https://startbootstrap.com/theme/freelancer', description:'A composed corporate profile with structured sections and a confident hierarchy.', colors:{accent:'#ad7525',background:'#f8f9fc',text:'#203651',surface:'#eef2f8'}, layouts:{experience:'compact',education:'compact'} },
  { id:'massively', name:'Grid', original:true, category:'Creative', source:'https://html5up.net/massively', description:'An image-led project grid with consistent tiles and generous breathing room.', colors:{accent:'#b65c43',background:'#fffcf8',text:'#343234',surface:'#f5eee8'}, projectsFirst:true, layouts:{projects:'grid'} },
  { id:'macfolio', name:'Card-Based', original:true, category:'Professional', source:'https://github.com/msafdev/macfolio', description:'A modular collection of profile, skill, experience, and project cards.', colors:{accent:'#bd5431',background:'#f2f1ed',text:'#34383a',surface:'#ffffff'}, layouts:{experience:'cards',education:'cards',skills:'cards',projects:'grid'} },
  { id:'press', name:'Timeline', original:true, category:'Professional', source:'https://html5up.net/editorial', description:'Your career journey, with experience and education connected along a timeline.', colors:{accent:'#756741',background:'#f6f2e9',text:'#34322d',surface:'#fffcf6'}, layouts:{experience:'timeline',education:'timeline'} },
  { id:'strata', name:'Sidebar', original:true, category:'Clean', source:'https://html5up.net/strata', description:'A persistent identity and navigation sidebar beside flowing main content.', colors:{accent:'#ac593f',background:'#fcfaf6',text:'#3d3632',surface:'#f1eae1'}, layouts:{} },
  { id:'bento', name:'Bento Grid', original:true, featured:true, category:'Creative', source:'https://github.com/mkhoirulwafa18/bentofolio', description:'Different-sized cards bring your introduction, story, skills, and work together.', colors:{accent:'#345acb',background:'#f8f7f2',text:'#182c48',surface:'#e6edf8'}, projectsFirst:true, layouts:{skills:'cards'} },
]

export const sourcedPortfolioTemplates = portfolioTemplateIds.map(id => currentPortfolioTemplates.find(template => template.id === id))
export const portfolioTemplates = [...legacyPortfolioTemplates, ...currentPortfolioTemplates]

export const legacyPortfolioReplacement = { essential:'miniport',editorial:'press',showcase:'multiverse',studio:'massively',canvas:'bento',atelier:'press',mono:'nocturne',gridfolio:'macfolio',journal:'press',executive:'strata',outline:'strata',horizon:'freelancer' }

export function getPortfolioTemplate(id) {
  id = legacyPortfolioReplacement[id] || id
  return portfolioTemplates.find((template) => template.id === id) || sourcedPortfolioTemplates[0]
}
