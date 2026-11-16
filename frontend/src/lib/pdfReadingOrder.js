import { sectionHeading } from './resumeParsing/resumeParser.mjs'

function rowsFrom(items) {
  const rows = []
  for (const item of items.filter((item) => item.str?.trim()).sort((a, b) => b.transform[5] - a.transform[5] || a.transform[4] - b.transform[4])) {
    const y = item.transform[5]
    let row = rows.find((row) => Math.abs(row.y - y) < 3)
    if (!row) { row = { y, items: [] }; rows.push(row) }
    row.items.push(item)
  }
  return rows.sort((a, b) => b.y - a.y)
}
function line(items) {
  const sorted = items.sort((a, b) => a.transform[4] - b.transform[4])
  return sorted.reduce((text, item, index) => {
    const previous = sorted[index - 1]
    const gap = previous ? item.transform[4] - previous.transform[4] - previous.width : 0
    // Font changes can split an email into adjacent PDF text fragments.
    return text + (index && (gap > 1.2 || /\s$/.test(previous.str)) ? ' ' : '') + item.str
  }, '').trim()
}
function globalReadingOrder(items, pageWidth) {
  const rows = rowsFrom(items)
  const candidates = []
  for (const row of rows) {
    const sorted = row.items.sort((a, b) => a.transform[4] - b.transform[4])
    for (let i = 1; i < sorted.length; i++) {
      const left = sorted[i - 1].transform[4] + sorted[i - 1].width
      const right = sorted[i].transform[4]
      if (right - left > pageWidth * 0.07 && left > pageWidth * 0.15 && right < pageWidth * 0.9) candidates.push((left + right) / 2)
    }
  }
  let best
  for (const cut of candidates) {
    const left = rows.map((row) => line(row.items.filter((item) => item.transform[4] < cut)))
    const right = rows.map((row) => line(row.items.filter((item) => item.transform[4] >= cut)))
    const leftHeadings = left.filter((value) => sectionHeading(value)).length
    const rightHeadings = right.filter((value) => sectionHeading(value)).length
    const crossing = rows.filter((row) => row.items.some((item) => item.transform[4] < cut && item.transform[4] + item.width > cut + 8)).length
    // Right-aligned dates are metadata, not a second text column.
    const prose = right.filter((value) => value.split(/\s+/).length > 4).length
    const score = leftHeadings + rightHeadings - crossing * 2
    if (leftHeadings && rightHeadings && (prose > 0 || right.filter(Boolean).length >= 3) && crossing < 3 && (!best || score > best.score)) best = { cut, left, right, score }
  }
  if (!best) return rows.map((row) => line(row.items)).join('\n')
  const firstSection = rows.findIndex((_, i) => sectionHeading(best.left[i]) || sectionHeading(best.right[i]))
  const header = rows.slice(0, firstSection).map((row) => line(row.items))
  return [...header, '', ...best.left.slice(firstSection).filter(Boolean), '', ...best.right.slice(firstSection).filter(Boolean)].join('\n')
}

// A resume can switch from full-width prose to columns inside one section.
export function pdfReadingOrder(items, pageWidth) {
  const rows = rowsFrom(items)
  const sections = rows.map((row, index) => ({ index, heading: sectionHeading(line(row.items)) })).filter((item) => item.heading)
  if (sections.length < 2) return globalReadingOrder(items, pageWidth)
  const output = []
  const header = rows.slice(0, sections[0].index)
  for (const row of header) {
    const parts = []
    for (const item of row.items.sort((a,b) => a.transform[4] - b.transform[4])) {
      const group = parts.at(-1)
      const previous = group?.at(-1)
      const gap = previous ? item.transform[4] - previous.transform[4] - previous.width : 0
      if (!group || gap > 12) parts.push([item]); else group.push(item)
    }
    output.push(...parts.map(line))
  }
  for (let i = 0; i < sections.length; i++) {
    const { index, heading } = sections[i]
    output.push(line(rows[index].items))
    const body = rows.slice(index + 1, sections[i + 1]?.index ?? rows.length)
    if (['skills','certifications','languages'].includes(heading.type)) {
      const cuts = body.flatMap((row) => row.items.slice(1).map((item,j) => {
        const left = row.items[j].transform[4] + row.items[j].width
        return item.transform[4] - left > pageWidth * .06 ? (left + item.transform[4]) / 2 : null
      })).filter((cut) => cut > pageWidth * .25 && cut < pageWidth * .8)
      const cut = cuts.find((cut) => body.filter((row) => row.items.some((item) => item.transform[4] < cut) && row.items.some((item) => item.transform[4] >= cut)).length >= 2 &&
        !body.some((row) => row.items.some((item) => item.transform[4] < cut && item.transform[4] + item.width > cut + 4)))
      if (cut) {
        for (const side of [false,true]) {
          output.push('', ...body.map((row) => line(row.items.filter((item) => (item.transform[4] >= cut) === side))).filter(Boolean), '')
        }
        continue
      }
    }
    for (const row of body) {
      // Dates and locations on the right belong to this entry, never its prose.
      if (['experience','education'].includes(heading.type)) {
        const right = row.items.filter((item) => item.transform[4] > pageWidth * .7)
        const left = row.items.filter((item) => item.transform[4] <= pageWidth * .7)
        const metadata = line(right)
        if (left.length && right.length && (/^\d{1,4}[/-]|^(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(metadata) || /^[\p{L} .'-]+,\s*[\p{L} .'-]+$/u.test(metadata))) {
          if (/^\d|^(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(metadata)) output.push(line(left), metadata); else output.push(metadata, line(left)); continue
        }
      }
      output.push(line(row.items))
    }
  }
  return output.join('\n')
}
