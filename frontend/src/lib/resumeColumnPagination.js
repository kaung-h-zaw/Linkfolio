import { packResumeColumns, resumeElementColumn } from './resumeColumnFlow.js'

// Keep one measurement tree per sheet and append each entry only once.
export function paginateColumns({batches,source,measure,pageHeight,bottomInset,screenScale}) {
  const result = []
  const extra = []
  let sourceIndex = 0
  const makeSheet = () => {
    const article = measure.cloneNode(false)
    measure.after(article)
    extra.push(article)
    return {article,units:[],lastUnit:null,lastElement:null}
  }
  const fits = (sheet,element) => {
    const bottom = sheet.article.getBoundingClientRect().top + (pageHeight-bottomInset)*screenScale
    return [element,...element.querySelectorAll('*')].every(node => node.getBoundingClientRect().bottom <= bottom + .5*screenScale)
  }
  const append = (sheet,unit,original) => {
    const clone = original.cloneNode(true)
    const previous = sheet.lastUnit
    let element = clone
    let added
    if (unit.section && previous?.section === unit.section && !previous.zoom) {
      element = sheet.lastElement
      const destination = unit.wrapper ? element.children[1] : element
      added = unit.wrapper ? [...clone.children[1].children] : [...clone.children].slice(1)
      destination.append(...added)
    } else { sheet.article.append(clone); added = [clone] }
    packResumeColumns(sheet.article)
    return {element,remove:() => added.forEach(node => node.remove())}
  }
  try {
    for (const batch of batches) {
      const sheets = []
      const columnPages = {left:0,right:0}
      for (const unit of batch) {
        const original = source.children[sourceIndex++]
        const column = resumeElementColumn(original)
        let page = column === 'full' ? Math.max(columnPages.left,columnPages.right) : columnPages[column]
        sheets[page] ||= makeSheet()
        let sheet = sheets[page]
        let candidate = append(sheet,unit,original)
        let fitting = fits(sheet,candidate.element)
        if (!fitting && sheet.units.length) {
          candidate.remove()
          page++
          sheets[page] ||= makeSheet()
          sheet = sheets[page]
          candidate = append(sheet,unit,original)
          fitting = fits(sheet,candidate.element)
        }
        let next = unit
        if (!fitting) {
          const element = candidate.element
          const paddingTop = parseFloat(getComputedStyle(sheet.article).paddingTop)
          const available = pageHeight-paddingTop-bottomInset
          const extent = (Math.max(...[element,...element.querySelectorAll('*')].map(child => child.getBoundingClientRect().bottom))-sheet.article.getBoundingClientRect().top)/screenScale-paddingTop
          const zoom = Math.min(1,available/(extent+1))
          element.style.zoom = zoom
          packResumeColumns(sheet.article)
          next = {...unit,zoom}
        }
        sheet.units.push(next)
        sheet.lastUnit = next
        sheet.lastElement = candidate.element
        if (column === 'full') columnPages.left = columnPages.right = page
        else columnPages[column] = page
      }
      result.push(...sheets.filter(Boolean).map(sheet => sheet.units))
    }
    return result
  } finally { extra.forEach(article => article.remove()) }
}
