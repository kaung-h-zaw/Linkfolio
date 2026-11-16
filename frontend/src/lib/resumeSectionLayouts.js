// Present the summary as a flowing paragraph without changing its saved rich text.
export function summaryAsParagraph(content) {
  function blocks(node) {
    if (node.type === 'paragraph') return [node.content || []]
    if (node.type === 'text' || node.type === 'hardBreak') return [[node]]
    return (node.content || []).flatMap(blocks)
  }
  const parts = blocks(content).map((nodes) => nodes.map((node) => node.type === 'hardBreak'
    ? {type:'text',text:' '}
    : node.type === 'text' ? {...node,text:(node.text || '').replace(/\s*\n\s*/g,' ')} : node))
    .filter((nodes) => nodes.some((node) => node.text?.trim()))
  const inline = parts.flatMap((nodes,index) => index ? [{type:'text',text:' '},...nodes] : nodes)
  return {type:'doc',content:[{type:'paragraph',content:inline}]}
}
