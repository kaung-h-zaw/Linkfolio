// Resume names often use capitals; portfolio identity text uses natural casing.
export function portfolioDisplayName(value) {
  const name = value?.trim().replace(/\s+/g, ' ') || 'Your name'
  if (!name.includes(' ') || name !== name.toLocaleUpperCase() || name === name.toLocaleLowerCase()) return name
  return name.split(' ').map(word => word.length <= 2 ? word : word.toLocaleLowerCase().replace(/(^|[-’'])(\p{L})/gu, (_, separator, letter) => separator + letter.toLocaleUpperCase())).join(' ')
}

export function portfolioInitials(value) {
  const words = value.trim().split(/\s+/).filter(Boolean)
  return [words[0], words.length > 1 ? words.at(-1) : undefined].filter(Boolean).map(word => Array.from(word)[0]).join('').toLocaleUpperCase()
}
