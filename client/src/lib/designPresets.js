// Coordinated starting points. Presets only change presentation, never content.
export const resumeSpacing = [
  { id: 'compact', name: 'Compact', values: { lineHeight: 1.3, sectionGap: 14, entryGap: 8, marginX: 32, marginY: 32 } },
  { id: 'balanced', name: 'Balanced', values: { lineHeight: 1.45, sectionGap: 20, entryGap: 12, marginX: 44, marginY: 42 } },
  { id: 'spacious', name: 'Spacious', values: { lineHeight: 1.6, sectionGap: 28, entryGap: 18, marginX: 48, marginY: 48 } },
]
export const portfolioSpacing = [
  { id: 'compact', name: 'Compact', values: { sectionSpace: 32, gutter: 24, projectGap: 20 } },
  { id: 'balanced', name: 'Balanced', values: { sectionSpace: 64, gutter: 48, projectGap: 32 } },
  { id: 'spacious', name: 'Spacious', values: { sectionSpace: 88, gutter: 56, projectGap: 40 } },
]
export function matchesPreset(current, values) {
  return Object.entries(values).every(([key, value]) => current[key] === value)
}

export const resumeFontChoices = [
  { id: 'template', name: 'Original', family: 'inherit' },
  { id: 'Arial, sans-serif', name: 'Modern', family: 'Arial, sans-serif' },
  { id: 'Georgia, serif', name: 'Classic', family: 'Georgia, serif' },
]
export const portfolioFontChoices = [
  { id: 'template', name: 'Original', family: 'inherit' },
  { id: 'sans', name: 'Modern', family: 'Arial, sans-serif' },
  { id: 'serif', name: 'Classic', family: 'Georgia, serif' },
]
