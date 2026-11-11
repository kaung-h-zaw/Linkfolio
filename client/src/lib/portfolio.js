import { isExtraSection } from './contentCatalog.js'
import { validDetailPages } from './portfolioContent.js'
import { validPortfolioDesign } from './portfolioDesign.js'
import { validPortfolioImages } from './portfolioImages.js'
import { validResumeAttachment } from './resumeAttachment.js'
import { portfolioTemplates } from './portfolioTemplates.js'
import { validSectionLayouts } from './portfolioSections.js'
export const defaultPortfolio = {
  resumeDownload: false,
  resumeFile: null,
  sectionLayouts: {},
  template: 'bento',
  surface: '#f1f6f2',
  headline: '',
  introduction: '',
  availability: '',
  color: '#137763',
  about: true,
  projects: true,
  experience: true,
  education: true,
  skills: true,
  contact: true,
  certifications: true,
  languages: true,
}
export function validPortfolio(value) {
  return (
    value &&
    typeof value === 'object' &&
    Object.entries(defaultPortfolio).every(
      ([key, fallback]) =>
        (['template', 'surface', 'sectionLayouts', 'resumeDownload', 'resumeFile', 'certifications', 'languages'].includes(key) &&
          value[key] === undefined) ||
        typeof value[key] === typeof fallback,
    ) &&
    (value.sectionTitles === undefined || (value.sectionTitles && typeof value.sectionTitles === 'object' && !Array.isArray(value.sectionTitles) && Object.entries(value.sectionTitles).every(([key,title]) => (['about','projects','experience','education','skills','certifications','languages','contact'].includes(key) || isExtraSection(key)) && typeof title === 'string' && title.length <= 80))) &&
    (value.sourceResume === undefined || (value.sourceResume && !Array.isArray(value.sourceResume) && typeof value.sourceResume === 'object' && Object.keys(value.sourceResume).every((key) => ['id','name'].includes(key)) && typeof value.sourceResume.id === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(value.sourceResume.id) && typeof value.sourceResume.name === 'string' && value.sourceResume.name.length <= 240)) &&
    (value.extraSectionVisibility === undefined || (value.extraSectionVisibility && typeof value.extraSectionVisibility === 'object' && !Array.isArray(value.extraSectionVisibility) && Object.entries(value.extraSectionVisibility).every(([key,visible]) => isExtraSection(key) && typeof visible === 'boolean'))) &&
    validDetailPages(value.detailPages) &&
    (value.custom === undefined || typeof value.custom === 'boolean') &&
    validPortfolioDesign(value.design) &&
    validPortfolioImages(value.images) &&
    (value.resumeFile === undefined || validResumeAttachment(value.resumeFile)) &&
    (value.sectionLayouts === undefined ||
      validSectionLayouts(value.sectionLayouts)) &&
    /^#[0-9a-f]{6}$/i.test(value.color) &&
    (value.template === undefined ||
      portfolioTemplates.some((template) => template.id === value.template)) &&
    (value.surface === undefined || /^#[0-9a-f]{6}$/i.test(value.surface))
  )
}
