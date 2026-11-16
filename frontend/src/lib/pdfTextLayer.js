// Keep the captured page appearance while making ATS exports searchable and copyable.
// Text follows document order, with line positions measured from the paginated DOM.
export function addPdfTextLayer(pdf, page, width, height) {
  const bounds = page.getBoundingClientRect()
  const scaleX = width / bounds.width, scaleY = height / bounds.height
  const walker = document.createTreeWalker(page, NodeFilter.SHOW_TEXT)
  const range = document.createRange()
  let node
  while ((node = walker.nextNode())) {
    if (!node.textContent.trim() || node.parentElement.closest('svg,script,style,[hidden]')) continue
    const style = getComputedStyle(node.parentElement)
    if (style.visibility === 'hidden' || style.display === 'none') continue
    const lines = []
    for (let index = 0; index < node.length; index++) {
      range.setStart(node, index)
      range.setEnd(node, index + 1)
      const rect = range.getBoundingClientRect()
      if (!rect.width || !rect.height) continue
      const previous = lines.at(-1)
      if (previous && Math.abs(previous.top - rect.top) < 1) previous.text += node.textContent[index]
      else lines.push({ text:node.textContent[index], left:rect.left, top:rect.top, height:rect.height })
    }
    const font = /monospace|courier/i.test(style.fontFamily) ? 'courier' : /times|georgia|^serif/i.test(style.fontFamily) ? 'times' : 'helvetica'
    const bold = Number(style.fontWeight) >= 600, italic = style.fontStyle === 'italic'
    pdf.setFont(font, bold ? italic ? 'bolditalic' : 'bold' : italic ? 'italic' : 'normal')
    pdf.setFontSize(parseFloat(style.fontSize) * scaleY * 72 / 25.4)
    for (const line of lines) {
      let text = line.text.replace(/\s+/g, ' ').trim()
      if (!text) continue
      if (style.textTransform === 'uppercase') text = text.toLocaleUpperCase()
      if (style.textTransform === 'lowercase') text = text.toLocaleLowerCase()
      pdf.text(text, (line.left - bounds.left) * scaleX,
        (line.top - bounds.top + line.height * .8) * scaleY, { renderingMode:'invisible' })
    }
  }
  range.detach()
}
