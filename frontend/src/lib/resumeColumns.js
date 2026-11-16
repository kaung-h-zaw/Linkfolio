export function resumeLayout(design, template) {
  if (['one','two','mixed'].includes(design.layout)) return design.layout
  if (['deedy','alta'].includes(template?.reference)) return 'mixed'
  if (['flowcv-atlantic-blue','twentyone'].includes(template?.reference) || ['slate','grid','canvas'].includes(template?.id)) return 'two'
  if (template?.category === 'Sidebar') return 'two'
  return ['one','two','mixed'].includes(template?.defaults?.layout) ? template.defaults.layout : 'one'
}

export function resumeColumnRatio(design, template) {
  if (Number.isFinite(design.columnRatio)) return design.columnRatio
  if (design.layout === 'template') {
    if (template?.reference === 'flowcv-atlantic-blue') return 42
    if (['deedy','twentyone'].includes(template?.reference)) return 36
    if (template?.reference === 'alta') return 62
  }
  return 45
}

export function sectionColumn(key, index, design, template) {
  if (design.sectionColumns?.[key]) return design.sectionColumns[key]
  if (design.layout === 'template') {
    const reference = template?.reference
    if (reference === 'flowcv-atlantic-blue') return ['summary','languages','awards'].includes(key) ? 'left' : 'right'
    if (['deedy','alta','twentyone'].includes(reference)) {
      if (['education','skills','certifications'].includes(key)) return reference === 'alta' ? 'right' : 'left'
      if (['experience','projects'].includes(key)) return reference === 'alta' ? 'left' : 'right'
      return reference === 'twentyone' ? 'right' : 'full'
    }
  }
  if (design.layout === 'mixed' && index === 0) return 'full'
  return (index - (design.layout === 'mixed' ? 1 : 0)) % 2 === 0 ? 'left' : 'right'
}

export function moveColumnSection(sections, columns, key, column, before) {
  const order = sections.map(section => section.key).filter(item => item !== key)
  const index = before ? order.indexOf(before) : -1
  if (index >= 0) order.splice(index, 0, key)
  else order.push(key)
  return { sectionOrder:order, sectionColumns:{ ...columns, [key]:column } }
}
