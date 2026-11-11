// The public catalog is deliberately smaller than the renderers' compatibility catalog.
export const resumeTemplateIds = ['flowcv-classic-serif', 'flowcv-mercury-flow', 'flowcv-rose-letter', 'flowcv-editorial-rule', 'flowcv-precision-line', 'flowcv-atlantic-blue']
export const freeResumeTemplateIds = ['flowcv-classic-serif','flowcv-editorial-rule','flowcv-precision-line']
export const portfolioTemplateIds = ['miniport', 'nocturne', 'multiverse', 'freelancer', 'strata', 'bento']
export const templateNames = {
  resume: { 'flowcv-classic-serif':'Classic Serif', 'flowcv-mercury-flow':'Mercury Flow', 'flowcv-rose-letter':'Rose Letter', 'flowcv-editorial-rule':'Editorial Rule', 'flowcv-precision-line':'Precision Line', 'flowcv-atlantic-blue':'Atlantic Blue' },
  portfolio: { miniport:'Minimal', nocturne:'Developer', multiverse:'Creative', freelancer:'Professional', strata:'Sidebar', bento:'Bento Grid' },
}
export function isSelectableTemplate(template) {
  return (template.kind === 'resume' ? resumeTemplateIds : template.kind === 'portfolio' ? portfolioTemplateIds : []).includes(template.id)
}
