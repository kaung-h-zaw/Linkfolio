import { isExtraSection } from './contentCatalog.js'
import { getProjects, visibleEntries } from './additionalSections.js'
import { portfolioImageSource } from './portfolioImages.js'
import { profileLinkHref } from './profileLinks.js'
import { entryHasContent } from './sectionContent.js'

export function portfolioExtraSections(profile) {
  return (profile?.extraContent || []).filter((section) => isExtraSection(section.type) && !(profile.removedSections || []).includes(section.type))
    .map((section) => ({...section, entries: section.entries.filter((entry) => entry.visible && entryHasContent(entry)).map((entry) => section.format === 'skills' ? {id:entry.id,name:entry.name,content:entry.content,visible:entry.visible} : entry)}))
}
export function portfolioCustomSections(profile, settings = {}) {
  return portfolioExtraSections(profile).filter((section) => (settings.extraSectionVisibility?.[section.type] ?? settings.custom !== false) && section.entries.length)
}
export function portfolioDetailEntries(profile,settings) {
  const projects=settings.projects !== false && !(profile.removedSections || []).includes('projects') ? visibleEntries(getProjects(profile),['name','subtitle','url','github']) : []
  const custom=portfolioCustomSections(profile,settings).flatMap((section)=>section.entries.map((entry)=>({...entry,sectionTitle:settings.sectionTitles?.[section.type] || section.heading})))
  return [...projects.map((entry)=>({key:`projects:${entry.id}`,kind:'projects',entry,title:entry.name || 'Project'})),...custom.map((entry)=>({key:`custom:${entry.id}`,kind:'custom',entry,title:entry.name || entry.sectionTitle || 'Details'}))]
}
export function validDetailPages(value) {
  return value === undefined || Boolean(value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length<=40 && Object.entries(value).every(([key,config])=>
    /^(projects|custom):[\w-]{1,100}$/.test(key) && config && typeof config==='object' && !Array.isArray(config) && Object.keys(config).every((field)=>['enabled','images','title','subtitle','description','url','github'].includes(field)) && typeof config.enabled==='boolean' &&
    Object.entries({title:160,subtitle:300,description:20000,url:2048,github:2048}).every(([field,max])=>config[field]===undefined || (typeof config[field]==='string' && config[field].length<=max && (!['url','github'].includes(field) || !config[field].trim() || Boolean(profileLinkHref(config[field]))))) &&
    (config.images === undefined || (Array.isArray(config.images) && config.images.length<=4 && config.images.every((src)=>Boolean(portfolioImageSource(src)))))
  ) && JSON.stringify(value).length<2_000_000)
}
export function detailImages(item,settings) {
  return [...new Set([...(item.kind==='projects' ? [settings.images?.projects?.[item.entry.id]] : []),...(settings.detailPages?.[item.key]?.images || [])].map(portfolioImageSource).filter(Boolean))]
}
