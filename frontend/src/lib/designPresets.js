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


// Styling alternatives keep the selected template's structure and section order.
export const resumeStyles = [
  { id:'minimal', name:'Minimal', description:'Quiet sans serif type and open headings.', values:{font:'Arial, sans-serif',nameFont:'template',color:'#30363c',header:'left',nameSize:30,headings:'plain',capitals:false,headingCase:'capitalize',accentName:false,accentTitle:false,accentHeadings:false,sectionGap:22,lineHeight:1.4} },
  { id:'executive', name:'Executive', description:'A formal serif masthead with deep green details.', values:{font:'Georgia, serif',nameFont:'template',color:'#28483e',header:'center',nameSize:32,headings:'rule',capitals:false,headingCase:'capitalize',accentName:false,accentTitle:false,accentHeadings:true,sectionGap:20,lineHeight:1.35} },
  { id:'elegant', name:'Elegant', description:'Refined serif type and soft wine accents.', values:{font:'Georgia, serif',nameFont:'template',color:'#794658',header:'center',nameSize:34,headings:'rule',capitals:false,headingCase:'capitalize',accentName:true,accentTitle:false,accentHeadings:true,sectionGap:20,lineHeight:1.45} },
]
