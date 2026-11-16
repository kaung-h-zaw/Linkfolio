// Pixel-sized grid tracks let each column stack without sharing section heights.
export function columnTracks(items) {
  const cursor = { left:0, right:0 }
  return items.map(({ column, height }) => {
    const start = column === 'full' ? Math.max(cursor.left,cursor.right) : cursor[column]
    const span = Math.max(1,Math.ceil(height))
    if (column === 'full') cursor.left = cursor.right = start + span
    else cursor[column] = start + span
    return { start:Math.round(start)+1, span }
  })
}

export function resumeElementColumn(element, style = getComputedStyle(element)) {
  const start = style.gridColumnStart
  const end = style.gridColumnEnd
  if (end === '-1' || end === '3' && start === '1' || end === 'span 2') return 'full'
  return start === '2' ? 'right' : 'left'
}

export function packResumeColumns(article) {
  if (!article) return
  const computed = getComputedStyle(article)
  if (computed.display !== 'grid' || computed.gridTemplateColumns.trim().split(/\s+/).length !== 2) return
  const elements = [...article.children].filter(element => element.tagName !== 'FOOTER')
  article.style.gridAutoRows = '1px'
  article.style.gridTemplateRows = 'none'
  article.style.rowGap = '0'
  article.style.alignItems = 'start'
  const scale = article.getBoundingClientRect().width / article.offsetWidth || 1
  elements.forEach(element => { element.style.alignSelf = 'start' })
  const items = elements.map(element => {
    const style = getComputedStyle(element)
    return {column:resumeElementColumn(element,style),height:element.getBoundingClientRect().height / scale + parseFloat(style.marginTop || 0) + parseFloat(style.marginBottom || 0)}
  })
  columnTracks(items).forEach(({start,span},index) => {
    elements[index].style.gridRow = `${start} / span ${span}`
  })
}
