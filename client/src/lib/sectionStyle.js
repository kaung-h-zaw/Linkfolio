import { isExtraSection, isCustomSection } from './contentCatalog.js'
// Shared, bounded section overrides. Missing values inherit the document style.
export function validSectionStyles(value, allowedKeys) {
  return value === undefined || Boolean(value && typeof value === 'object' && !Array.isArray(value) &&
    Object.keys(value).length <= 50 && Object.entries(value).every(([key, style]) =>
      (allowedKeys ? allowedKeys.includes(key) : /^[a-zA-Z0-9_-]{1,100}$/.test(key)) &&
      style && typeof style === 'object' && !Array.isArray(style) && Object.entries(style).every(([name, item]) => {
        if (name === 'title') return typeof item === 'string' && item.length <= 80
        if (name === 'contentLayout') return (key === 'summary' ? ['bullets'] : ['skills','languages'].includes(key) ? ['list','columns','tags','compact','level'] : key === 'certifications' ? ['list','columns','tags','compact'] : isCustomSection(key) ? ['list','columns','tags','compact'] : isExtraSection(key) ? ['list','columns'] : []).includes(item)
        if (name === 'titleOrder') return ['experience','education'].includes(key) && ['title-subtitle','subtitle-title'].includes(item)
        if (name === 'summaryInHeader' || name === 'hideHeading') return key === 'summary' && typeof item === 'boolean'
        if (name === 'columns') return (['skills','languages','certifications'].includes(key)||isCustomSection(key)) && [1,2,3,4].includes(item)
        if (name === 'rowBullets') return (['skills','languages','certifications'].includes(key)||isCustomSection(key)) && typeof item === 'boolean'
        const collectionChoices={rowSpacing:['tight','spacious'],compactSeparator:['bullet','pipe','comma'],subinfoStyle:['colon','dash','brackets'],levelDisplay:['text','dots','bar']}
        if (collectionChoices[name]) return (['skills','languages','certifications'].includes(key)||isCustomSection(key)) && (name!=='levelDisplay'||key!=='certifications') && collectionChoices[name].includes(item)
        if (name === 'entryLayout') return ['full', 'columns'].includes(item)
        if (name === 'hidden') return typeof item === 'boolean'
        if (name === 'accent') return typeof item === 'string' && /^#[0-9a-f]{6}$/i.test(item)
        const ranges = { fontSize: [11, 22], headingSize: [10, 88], lineHeight: [1.2, 2.2], spacing: [0, 100] }
        return Boolean(ranges[name] && Number.isFinite(item) && item >= ranges[name][0] && item <= ranges[name][1])
      })))
}

export function sectionStyleProps(style = {}) {
  return {
    'data-section-entry-layout': style.entryLayout,
    'data-section-font': style.fontSize !== undefined ? 'true' : undefined,
    'data-section-heading': style.headingSize !== undefined ? 'true' : undefined,
    'data-section-line': style.lineHeight !== undefined ? 'true' : undefined,
    'data-section-spacing': style.spacing !== undefined ? 'true' : undefined,
    'data-section-accent': style.accent ? 'true' : undefined,
    style: {
      '--section-font': style.fontSize === undefined ? undefined : `${style.fontSize}px`,
      '--section-heading': style.headingSize === undefined ? undefined : `${style.headingSize}px`,
      '--section-line': style.lineHeight,
      '--section-spacing': style.spacing === undefined ? undefined : `${style.spacing}px`,
      '--section-accent': style.accent,
    },
  }
}
