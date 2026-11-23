import { portfolioTemplateIds } from './templateCatalog.js'

// The selectable catalog is the only source of portfolio template definitions.
const currentPortfolioTemplates = [
  { id:'miniport', name:'Minimal', original:true, category:'Clean', source:'https://html5up.net/miniport', description:'Simple sections, clean typography, and quiet details that let your work speak.', colors:{accent:'#2862d7',background:'#ffffff',text:'#19325b',surface:'#f4f7fc'}, layouts:{projects:'list',skills:'list'} },
  { id:'nocturne', name:'Developer', original:true, category:'Professional', source:'https://brittanychiang.com', description:'A dark developer workspace with numbered sections, skill cards, and project cards.', colors:{accent:'#d8ec79',background:'#181b1d',text:'#f2f1e8',surface:'#22272a'}, projectsFirst:true, layouts:{projects:'grid',skills:'cards'} },
  { id:'multiverse', name:'Creative', original:true, category:'Creative', source:'https://html5up.net/multiverse', description:'Large images, expressive typography, and colourful, asymmetric work layouts.', colors:{accent:'#9055be',background:'#fff8f2',text:'#372944',surface:'#f3e7fa'}, projectsFirst:true, layouts:{} },
  { id:'freelancer', name:'Professional', original:true, category:'Professional', source:'https://startbootstrap.com/theme/freelancer', description:'A composed corporate profile with structured sections and a confident hierarchy.', colors:{accent:'#ad7525',background:'#f8f9fc',text:'#203651',surface:'#eef2f8'}, layouts:{experience:'compact',education:'compact'} },
  { id:'strata', name:'Sidebar', original:true, category:'Clean', source:'https://html5up.net/strata', description:'A persistent identity and navigation sidebar beside flowing main content.', colors:{accent:'#ac593f',background:'#fcfaf6',text:'#3d3632',surface:'#f1eae1'}, layouts:{} },
  { id:'bento', name:'Bento Grid', original:true, featured:true, category:'Creative', source:'https://github.com/mkhoirulwafa18/bentofolio', description:'Different-sized cards bring your introduction, story, skills, and work together.', colors:{accent:'#345acb',background:'#f8f7f2',text:'#182c48',surface:'#e6edf8'}, projectsFirst:true, layouts:{skills:'cards'} },
]

export const sourcedPortfolioTemplates = portfolioTemplateIds.map(id => currentPortfolioTemplates.find(template => template.id === id))
export const portfolioTemplates = [...currentPortfolioTemplates]

export const legacyPortfolioReplacement = { essential:'miniport',editorial:'miniport',showcase:'multiverse',studio:'multiverse',canvas:'bento',atelier:'multiverse',mono:'nocturne',gridfolio:'bento',journal:'miniport',executive:'strata',outline:'strata',horizon:'freelancer',massively:'bento',macfolio:'bento',press:'miniport' }

export function getPortfolioTemplate(id) {
  id = legacyPortfolioReplacement[id] || id
  return portfolioTemplates.find((template) => template.id === id) || sourcedPortfolioTemplates[0]
}
