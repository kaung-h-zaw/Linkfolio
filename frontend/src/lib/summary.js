export function textDocument(text = '') {
  return {
    type: 'doc',
    content: text.split('\n').map((line) => ({
      type: 'paragraph',
      ...(line ? { content: [{ type: 'text', text: line }] } : {}),
    })),
  }
}
export function summaryText(node) {
  // Optional relational fields can be absent on older or partially populated
  // documents. Treat them as empty content so a preview remains renderable.
  if (!node || typeof node !== 'object') return ''
  if (node.type === 'text') return node.text || ''
  return (node.content || [])
    .map(summaryText)
    .join(['doc', 'bulletList', 'orderedList'].includes(node.type) ? ' ' : '')
}
export function getSummary(profile) {
  return (
    profile.summarySection || {
      heading: 'Summary',
      entries: profile.personal.summary.trim()
        ? [
            {
              id: 'legacy-summary',
              visible: true,
              content: textDocument(profile.personal.summary),
            },
          ]
        : [],
    }
  )
}

export function validSummary(summary) {
  function validNode(node, depth = 0) {
    return (
      node &&
      depth < 30 &&
      [
        'doc',
        'paragraph',
        'text',
        'hardBreak',
        'bulletList',
        'orderedList',
        'listItem',
      ].includes(node.type) &&
      (node.text === undefined || typeof node.text === 'string') &&
      (node.content === undefined ||
        (Array.isArray(node.content) &&
          node.content.every((child) => validNode(child, depth + 1)))) &&
      (node.marks === undefined ||
        (Array.isArray(node.marks) &&
          node.marks.every(
            (mark) =>
              mark &&
              ['bold', 'italic', 'underline', 'link'].includes(mark.type) &&
              (mark.type !== 'link' || typeof mark.attrs?.href === 'string'),
          )))
    )
  }
  return (
    summary &&
    typeof summary.heading === 'string' &&
    Array.isArray(summary.entries) &&
    summary.entries.every(
      (entry) =>
        entry &&
        typeof entry.id === 'string' &&
        typeof entry.visible === 'boolean' &&
        entry.content?.type === 'doc' &&
        validNode(entry.content),
    ) &&
    new Set(summary.entries.map((entry) => entry.id)).size ===
      summary.entries.length
  )
}
