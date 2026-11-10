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

export const sourcedPortfolioTemplates = [
  { id: 'bento', name: 'Mosaic', original: true, category: 'Creative', featured: true, reference: 'Wafastarz', source: 'https://github.com/mkhoirulwafa18/bentofolio', demo: 'https://lavanya-bentofolio.vercel.app', description: 'An open ivory canvas with cobalt accents, an asymmetric portrait introduction and modular work cards.', images: 'Your portrait and actual project screenshots or artwork.', hero: 'portrait', layouts: {} },
  { id: 'macfolio', name: 'Workbench', original: true, category: 'Creative', featured: true, reference: 'msafdev', source: 'https://github.com/msafdev/macfolio', demo: 'https://macfolio-demo.vercel.app', description: 'A warm graphite workspace with a vertical identity marker, precise rules and an organized project board.', images: 'Optional portrait and product screenshots for the project window.', hero: 'portrait', projectsFirst: true, layouts: {} },
  { id: 'nocturne', name: 'Signal', original: true, category: 'Professional', featured: true, reference: 'Brittany Chiang', source: 'https://brittanychiang.com', repository: 'https://github.com/bchiang7/v4', demo: 'https://v4.brittanychiang.com', description: 'A black-and-lime developer portfolio with a bold typographic introduction and a numbered work index.', images: 'Project screenshots are the focus; a personal photo is optional.', hero: 'portrait', projectsFirst: true, layouts: {} },
  { id: 'strata', name: 'Meridian', original: true, category: 'Professional', reference: 'HTML5 UP', source: 'https://html5up.net/strata', description: 'A quiet ivory profile column beside a flowing editorial story, with terracotta details and serif headings.', images: 'Your portrait and screenshots of your work.', hero: 'portrait', layouts: {} },
  { id: 'miniport', name: 'Clear', original: true, category: 'Clean', reference: 'HTML5 UP', source: 'https://html5up.net/miniport', description: 'A crisp blue-and-white composition with a broad introduction, fine dividers and clean project summaries.', images: 'Your portrait and landscape project images.', hero: 'portrait', layouts: {} },
  { id: 'press', name: 'Folio', original: true, category: 'Editorial', reference: 'HTML5 UP', source: 'https://html5up.net/editorial', description: 'A paper-toned personal journal with a large serif name, an optional portrait and balanced editorial columns.', images: 'An optional personal photo and project screenshots.', hero: 'portrait', layouts: {} },
  { id: 'massively', name: 'Panorama', original: true, category: 'Editorial', reference: 'HTML5 UP', source: 'https://html5up.net/massively', description: 'A bright introduction with an optional portrait and a spacious featured project story.', images: 'An optional portrait and large project images.', hero: 'portrait', projectsFirst: true, layouts: {} },
  { id: 'multiverse', name: 'Aperture', original: true, category: 'Creative', reference: 'HTML5 UP', source: 'https://html5up.net/multiverse', description: 'A dark visual portfolio with a restrained profile and an asymmetric gallery of photographs or project images.', images: 'Photography, artwork, or screenshots for each project.', projectsFirst: true, layouts: {} },
  { id: 'freelancer', name: 'Summit', original: true, category: 'Professional', reference: 'Start Bootstrap', source: 'https://startbootstrap.com/theme/freelancer', description: 'A deep-blue professional profile with a tall portrait, cream display type and a confident gold accent.', images: 'Your portrait and images of your projects.', hero: 'portrait', projectsFirst: true, layouts: {} },
]
export const portfolioTemplates = [...legacyPortfolioTemplates, ...sourcedPortfolioTemplates]

export const legacyPortfolioReplacement = { essential:'miniport',editorial:'press',showcase:'multiverse',studio:'massively',canvas:'bento',atelier:'press',mono:'nocturne',gridfolio:'macfolio',journal:'press',executive:'strata',outline:'strata',horizon:'freelancer' }

export function getPortfolioTemplate(id) {
  id = legacyPortfolioReplacement[id] || id
  return portfolioTemplates.find((template) => template.id === id) || sourcedPortfolioTemplates[0]
}
