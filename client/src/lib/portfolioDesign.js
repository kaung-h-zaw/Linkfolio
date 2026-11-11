import { getPortfolioTemplate } from './portfolioTemplates.js'
import { isExtraSection } from './contentCatalog.js'
import { validSectionStyles } from './sectionStyle.js'
const portfolioSectionOrder = ['about','projects','experience','education','skills','certifications','languages','custom','contact']
export const portfolioFonts = { template:'Template font', sans:'Modern sans serif', serif:'Editorial serif', mono:'Monospace' }
export const portfolioDesignDefaults = {
  font:'template', palette:'template', background:'#ffffff', text:'#24313e', accentCustom:false,
  bodySize:15, titleSize:56, headingSize:30, lineHeight:1.7, sectionSpace:48, gutter:32,
  cardRadius:12, imageRadius:12, projectImageRadius:12, imageRatio:'template', imageFit:'cover', portraitShape:'template',
  portraitFrame:'template', portraitEffect:'template', imageFrame:'template', imageEffect:'template', coverEffect:'template', heroPosition:'center', imagePosition:'center', coverRatio:'template', portraitSize:240,
  projectColumns:'template', projectGap:24, sectionOrder:[],
}
const ranges = { bodySize:[12,22], titleSize:[28,88], headingSize:[20,44], lineHeight:[1.2,2.2], sectionSpace:[16,100], gutter:[12,64], cardRadius:[0,32], imageRadius:[0,32], projectImageRadius:[0,32], projectGap:[8,48], portraitSize:[100,360] }
const enums = { font:Object.keys(portfolioFonts), palette:['template','light','dark','custom'], imageRatio:['template','landscape','square','portrait','natural'], imageFit:['cover','contain'], portraitShape:['template','circle','rounded','square','arch','capsule','squircle','organic','diamond','hexagon','cutcorner'], projectColumns:['template','1','2','3'],portraitFrame:['template','none','outline','double','polaroid','offset','shadow','mat','raised','layered','floating'],imageFrame:['template','none','outline','double','polaroid','offset','shadow','mat','raised','layered','floating'],portraitEffect:['template','natural','grayscale','sepia','vivid','soft'],coverEffect:['template','natural','grayscale','sepia','vivid','soft'],heroPosition:['center','top','bottom','left','right'],imageEffect:['template','natural','grayscale','sepia','vivid','soft'],imagePosition:['center','top','bottom','left','right'],coverRatio:['template','wide','cinema','banner','square'] }
export function validPortfolioDesign(value) {
  return value === undefined || (value && typeof value === 'object' && !Array.isArray(value) && Object.entries(value).every(([key,item]) => {
    if (key === 'sectionStyles') return validSectionStyles(item, ['hero', ...portfolioSectionOrder])
    if (ranges[key]) return Number.isFinite(item) && item >= ranges[key][0] && item <= ranges[key][1]
    if (enums[key]) return enums[key].includes(item)
    if (['background','text'].includes(key)) return typeof item === 'string' && /^#[0-9a-f]{6}$/i.test(item)
    if (['accentCustom','textCustom'].includes(key)) return typeof item === 'boolean'
    if (key === 'sectionOrder') return Array.isArray(item) && item.length <= 50 && new Set(item).size === item.length && item.every((id) => portfolioSectionOrder.includes(id) || isExtraSection(id))
    return false
  }))
}
export function portfolioOrder(_template, design = {}, extraKeys) {
  const expand = (keys) => extraKeys ? keys.flatMap((key) => key === 'custom' ? extraKeys : [key]) : keys
  const base = expand(portfolioSectionOrder)
  const saved = extraKeys?.includes('custom') ? design.sectionOrder || [] : expand(design.sectionOrder || [])
  return [...new Set([...saved, ...base])].filter(key=>key!=='contact').concat('contact')
}
export function portfolioDesignStyle(settings) {
  const design = settings.design || {}
  const templateColors = getPortfolioTemplate(settings.template).colors || portfolioDesignDefaults
  const colors = design.palette === 'dark' ? {background:'#111827',text:'#e5e7eb',surface:'#1f2937'} : design.palette === 'light' ? {background:'#ffffff',text:'#24313e',surface:'#f4f6f8'} : design.palette === 'custom' ? {background:design.background || '#ffffff',text:design.text || '#24313e',surface:settings.surface || '#f1f6f2'} : templateColors
  const text = design.textCustom ? design.text || colors.text : colors.text
  const vars = { '--portfolio-accent':design.accentCustom ? settings.color || '#137763' : templateColors.accent || '#137763','--portfolio-surface':colors.surface,'--portfolio-background':colors.background,'--portfolio-text':text }
  if (design.palette && design.palette !== 'template') Object.assign(vars, {'--theme-paper':colors.background,'--theme-ink':text,'--theme-rule':`color-mix(in srgb, ${text} 18%, transparent)`,'--theme-muted':`color-mix(in srgb, ${text} 72%, ${colors.background})`})
  if (design.textCustom) Object.assign(vars, {'--theme-ink':text,'--theme-muted':`color-mix(in srgb, ${text} 72%, ${colors.background})`})
  if (design.accentCustom) vars['--theme-accent'] = settings.color || '#137763'
  const fonts = { sans:'Arial, Helvetica, sans-serif',serif:'Georgia, serif',mono:'"Courier New", monospace' }
  if (fonts[design.font]) vars['--portfolio-font'] = fonts[design.font]
  for (const key of Object.keys(ranges)) if (design[key] !== undefined) vars['--portfolio-' + key] = design[key] + (key === 'lineHeight' ? '' : 'px')
  return vars
}

export const portraitStylePresets = [
  {id:'polaroid',name:'Polaroid',shape:'square',frame:'polaroid'},
  {id:'double',name:'Double frame',shape:'rounded',frame:'double'},
  {id:'offset',name:'Offset',shape:'square',frame:'offset'},
  {id:'shadow',name:'Soft shadow',shape:'rounded',frame:'shadow'},
  {id:'outline',name:'Accent outline',shape:'rounded',frame:'outline'},
  {id:'mat',name:'Gallery mat',shape:'square',frame:'mat'},
  {id:'raised',name:'Raised frame',shape:'rounded',frame:'raised'},
  {id:'layered',name:'Layered print',shape:'square',frame:'layered'},
  {id:'floating',name:'Floating',shape:'rounded',frame:'floating'},
  {id:'clean',name:'Clean',shape:'square',frame:'none'},
  {id:'rounded',name:'Rounded',shape:'rounded',frame:'none'},
  {id:'circle',name:'Circle',shape:'circle',frame:'none'},
]

export const imageFrameOptions = {template:'Template default',none:'No frame',outline:'Accent outline',double:'Double frame',polaroid:'Polaroid',offset:'Offset shadow',shadow:'Soft shadow',mat:'Gallery mat',raised:'Raised frame',layered:'Layered print',floating:'Floating'}
export const imageEffectOptions = {template:'Template default',natural:'Original colors',grayscale:'Black and white',sepia:'Warm sepia',vivid:'Vivid',soft:'Soft and muted'}
