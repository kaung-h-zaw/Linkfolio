// Older drafts keep these as individual fields. An explicit array, including an
// empty one, takes precedence so removing every link stays removed on reload.
export function getProfileLinks(personal) {
  if (Array.isArray(personal.links))
    return personal.links.map((link) => {
      if (link.type) return link
      const known = [
        'Website',
        'LinkedIn',
        'GitHub',
        'WhatsApp',
        'Portfolio',
      ].includes(link.label)
      return {
        ...link,
        type: known ? link.label : 'Custom link',
        name: known ? '' : 'Custom link',
        label: known ? link.url.replace(/^https?:\/\//i, '') : link.label,
      }
    })
  return [
    ['website', 'Website'],
    ['linkedin', 'LinkedIn'],
    ['github', 'GitHub'],
  ]
    .filter(([key]) => personal[key]?.trim())
    .map(([key, type]) => ({
      id: `legacy-${key}`,
      type,
      label: personal[key].replace(/^https?:\/\//i, ''),
      url: personal[key],
    }))
}

export function profileLinkHref(value) {
  const text = value?.trim()
  if (!text || /\s/.test(text)) return undefined
  try {
    const url = new URL(
      /^[a-z][a-z\d+.-]*:/i.test(text) ? text : `https://${text}`,
    )
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      !url.hostname.includes('.') ||
      url.username ||
      url.password
    )
      return undefined
    return url.href
  } catch {
    return undefined
  }
}
