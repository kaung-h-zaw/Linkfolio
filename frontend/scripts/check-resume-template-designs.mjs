import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { getDesign } from '../src/lib/resumeDesign.js'
import { changeResumeTemplate, rememberTemplateDesigns, resumeStyleFromDocument, validTemplateDesigns } from '../src/lib/resumeTemplateDesign.js'
const require = createRequire(import.meta.url)
const { validateDocument } = require('../../backend/validation.js')

const templates = [
  {id:'template-a',defaults:{fontSize:14,layout:'one',color:'#193442'}},
  {id:'template-b',defaults:{fontSize:12,layout:'two',color:'#137763'}},
]
let state = resumeStyleFromDocument({templateId:'template-a'},templates)
state = {...state,design:{...state.design,fontSize:16,color:'#843b4d',sectionColumns:{summary:'left',experience:'right'},sectionOrder:['experience','summary']}}
const customA = structuredClone(state.design)
const reselected = changeResumeTemplate(state,'template-a',templates)
assert.deepEqual(reselected.design,getDesign(templates[0].defaults),'reselecting the active template resets its design')
assert.equal(reselected.design.sectionColumns,undefined,'custom column assignments are cleared')
assert.deepEqual(reselected.design.sectionOrder,[],'section ordering returns to the template default')
state = changeResumeTemplate(state,'template-b',templates)
assert.deepEqual(state.templateDesigns['template-a'],customA)
assert.deepEqual(state.design,getDesign(templates[1].defaults),'a different template applies all its own defaults')
state = {...state,design:{...state.design,fontSize:13,color:'#245778',columnRatio:40}}
const customB = structuredClone(state.design)
state = changeResumeTemplate(state,'template-a',templates)
assert.deepEqual(state.design,getDesign(templates[0].defaults),'returning to a used template applies its original design')
assert.deepEqual(state.templateDesigns['template-b'],customB)

// Editing after a reset still persists normally until the user chooses a template.
state = {...state,design:structuredClone(customA)}

const document = {
  id:'design-preservation-test',name:'Test resume',kind:'resume',personal:{fullName:'Test'},
  templateId:state.templateId,design:state.design,templateDesigns:rememberTemplateDesigns(state),
}
const saved = validateDocument(JSON.parse(JSON.stringify(document)),document.id)
const reopened = resumeStyleFromDocument(saved,templates)
assert.deepEqual(reopened.design,customA,'saving and reopening preserves the active design')
assert.deepEqual(changeResumeTemplate(reopened,'template-b',templates).design,getDesign(templates[1].defaults),'choosing a used template after reopening still resets it')
assert.deepEqual(reopened.templateDesigns['template-b'],customB,'opening a resume does not mutate saved settings')
assert.deepEqual(resumeStyleFromDocument({...saved,design:undefined},templates).design,customA,'stored snapshots recover missing active settings')
assert.deepEqual(resumeStyleFromDocument({templateId:'template-a'},templates).templateDesigns,{},'a different resume has independent settings')
assert.equal(validTemplateDesigns({'template-a':customA}),true)
assert.equal(validTemplateDesigns({'template-a':{fontSize:'invalid'}}),false)
assert.equal(validTemplateDesigns([]),false)
console.log('Passed: current/used template resets, cleared layout overrides, save/reopen preservation, and server validation.')
