import { validSectionStyles } from './sectionStyle.js'
export const defaultDesign = {
  font: 'template',
  fontSize: 14,
  nameSize: 36,
  lineHeight: 1.6,
  margin: 40,
  sectionGap: 24,
  color: '',
  layout: 'template',
  header: 'template',
  headings: 'template',
  capitals: true,
  underline: true,
  page: 'A4',
}
export const fonts = {
  template: 'Template default',
  'sans-serif': 'Sans serif',
  serif: 'Serif',
  'Georgia, serif': 'Georgia',
  'Arial, sans-serif': 'Arial',
}
export function validDesign(value) {
  if (!value || typeof value !== 'object' || !validSectionStyles(value.sectionStyles)) return false
  const choices = {
    nameFont: Object.keys(fonts),
    headerPosition: ['top', 'left', 'right'],
    headingIcons: ['none', 'outline', 'filled'],
    headingCase: ['capitalize', 'uppercase'],
    entryLayout: ['full', 'columns'],
    metadataPosition: ['right', 'left', 'split'],
    metadataOrder: ['date-location', 'location-date'],
    subtitlePlacement: ['below', 'inline'],
    contactArrangement: ['template','stacked','inline','columns'],
    contactIcons: ['none','plain','soft','outline'],
    nameWeight: ['template','normal','bold'],
    titleStyle: ['template','normal','italic'],
    titlePosition: ['below','inline'],
    photoPosition: ['left','top','right'],
    photoSize: ['xs','s','m','l','xl'],
    photoShape: ['circle','square','rounded','portrait'],
    linkIconStyle: ['chain','external'],
  }
  if (
    Object.entries(choices).some(
      ([key, options]) =>
        value[key] !== undefined && !options.includes(value[key]),
    )
  )
    return false
  if (
    ['pageColor', 'headerColor', 'borderColor'].some(
      (key) =>
        value[key] !== undefined &&
        value[key] !== '' &&
        !/^#[0-9a-f]{6}$/i.test(value[key]),
    )
  )
    return false
  if (
    [
      'accentName',
      'accentTitle',
      'accentHeadings',
      'accentDates',
      'accentEntries',
      'photoShow',
      'photoGrayscale',
      'linkBlue',
      'linkIcon',
      'footerPages',
      'footerEmail',
      'footerName',
    ].some((key) => value[key] !== undefined && typeof value[key] !== 'boolean')
  )
    return false
  const extras = {
    titleSize: [11, 26],
    headingSize: [10, 22],
    entrySize: [11, 24],
    marginX: [20, 60],
    marginY: [20, 60],
    entryGap: [4, 32],
    columnRatio: [30, 70],
  }
  if (
    Object.entries(extras).some(
      ([key, [min, max]]) =>
        value[key] !== undefined &&
        (!Number.isFinite(value[key]) || value[key] < min || value[key] > max),
    )
  )
    return false
  if (
    value.locale !== undefined &&
    !['en-GB', 'en-US', 'fr-FR', 'de-DE', 'es-ES'].includes(value.locale)
  )
    return false
  if (
    value.dateFormat !== undefined &&
    !['numeric', 'iso', 'short', 'long', 'year'].includes(value.dateFormat)
  )
    return false
  if (
    value.sectionOrder !== undefined &&
    (!Array.isArray(value.sectionOrder) ||
      value.sectionOrder.some((key) => typeof key !== 'string') ||
      new Set(value.sectionOrder).size !== value.sectionOrder.length)
  )
    return false
  return Object.entries(defaultDesign).every(([key, fallback]) => {
    const v = value[key]
    if (typeof v !== typeof fallback) return false
    const ranges = {
      fontSize: [11, 18],
      nameSize: [24, 80],
      lineHeight: [1.2, 2],
      margin: [20, 60],
      sectionGap: [12, 36],
    }
    if (ranges[key]) return v >= ranges[key][0] && v <= ranges[key][1]
    const options = {
      font: Object.keys(fonts),
      layout: ['template', 'one', 'two', 'mixed'],
      header: ['template', 'left', 'center'],
      headings: [
        'template',
        'plain',
        'rule',
        'band',
        'box',
        'short',
        'double',
        'accent',
        'overline',
      ],
      page: ['A4', 'Letter'],
    }
    if (options[key]) return options[key].includes(v)
    return key !== 'color' || v === '' || /^#[0-9a-f]{6}$/i.test(v)
  })
}

export const expandedDesign = {
  nameFont: 'template',
  headingIcons: 'none',
  entryLayout: 'full',
  metadataPosition: 'right',
  metadataOrder: 'date-location',
  subtitlePlacement: 'below',
  pageColor: '#ffffff',
  headerColor: '',
  borderColor: '',
  accentName: false,
  accentTitle: true,
  accentHeadings: true,
  accentDates: false,
  accentEntries: false,
  locale: 'en-GB',
  dateFormat: 'numeric',
  titleSize: 15,
  headingSize: 12,
  entrySize: 15,
  marginX: 40,
  marginY: 40,
  entryGap: 16,
  sectionOrder: [],
}
export function getDesign(value) {
  return {
    ...defaultDesign,
    ...expandedDesign,
    ...value,
    ...(value?.sectionStyles && typeof value.sectionStyles==='object' && !Array.isArray(value.sectionStyles) ? {sectionStyles:Object.fromEntries(Object.entries(value.sectionStyles).map(([key,style])=>[key,['skills','languages'].includes(key)&&style?.contentLayout==='level'?{...style,contentLayout:'columns'}:style]))}:{}),
    marginX: value?.marginX ?? value?.margin ?? 40,
    marginY: value?.marginY ?? value?.margin ?? 40,
  }
}
export function alignHeaderPhoto(design, template) {
  if (!design) return design
  const alignment = design.header === 'template' ? template?.defaults?.header || 'left' : design.header
  if (alignment === 'center' && design.photoPosition !== 'top') return { ...design, photoPosition:'top' }
  if (alignment === 'left' && design.photoPosition === 'top') return { ...design, photoPosition:'right' }
  return design
}
export function formatResumeDate(value, design) {
  if (!value) return ''
  const match = /^(\d{4})-(\d{2})$/.exec(value)
  if (!match) return value
  const [, year, month] = match
  if (+month < 1 || +month > 12) return value
  if (design?.dateFormat === 'year') return year
  if (design?.dateFormat === 'iso') return year + '-' + month
  if (design?.dateFormat === 'short' || design?.dateFormat === 'long')
    return new Intl.DateTimeFormat(design.locale || 'en-GB', {
      month: design.dateFormat,
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(Date.UTC(+year, +month - 1, 1)))
  return month + '/' + year
}
