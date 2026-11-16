import { getDesign, validDesign } from './resumeDesign.js'

export function validTemplateDesigns(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length <= 100 &&
    Object.entries(value).every(([key,design]) => /^[a-zA-Z0-9_-]{1,50}$/.test(key) && !['__proto__','constructor','prototype'].includes(key) && validDesign(design)))
}

export function resumeStyleFromDocument(document, templates) {
  const templateId = document.templateId || 'flowcv-classic-serif'
  return {
    templateId,
    design:getDesign({...templates.find(template => template.id === templateId)?.defaults,...(document.design || document.templateDesigns?.[templateId])}),
    templateDesigns:document.templateDesigns || {},
  }
}

export function rememberTemplateDesigns(state) {
  return {...state.templateDesigns,[state.templateId]:structuredClone(state.design)}
}

export function changeResumeTemplate(state, templateId, templates) {
  // Choosing a template is an explicit request to apply its original styling.
  const design = getDesign(structuredClone(templates.find(template => template.id === templateId)?.defaults || {}))
  return {templateId,templateDesigns:{...rememberTemplateDesigns(state),[templateId]:structuredClone(design)},design}
}
