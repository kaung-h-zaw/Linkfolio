const test=require('node:test')
const assert=require('node:assert/strict')
const {validExtraSections}=require('../client/src/lib/contentCatalog.js')
const {textDocument}=require('../client/src/lib/summary.js')
const entry={id:'custom-one',visible:true,name:'Mentor',content:textDocument('Helped new developers.')}
test('custom section types accept optional structured fields and preserve older simple sections',()=>{
  assert.equal(validExtraSections([{type:'custom',heading:'Volunteering',entries:[entry]}]),true)
  for(const format of ['standard','skills']) assert.equal(validExtraSections([{type:'custom',format,heading:'Volunteering',entries:[{...entry,subtitle:'Programme',startDate:'2025-01',endDate:'',current:true,location:'Bangkok',url:'https://example.com'}]}]),true)
  assert.equal(validExtraSections([{type:'interests',heading:'Interests',entries:[entry]}]),true)
})
test('custom section fields reject unknown types, malformed dates and invalid scalar fields',()=>{
  const base={type:'custom',format:'standard',heading:'Volunteering',entries:[entry]}
  assert.equal(validExtraSections([{...base,format:'arbitrary'}]),false)
  for(const fields of [{subtitle:12},{location:[]},{startDate:'2025-13'},{endDate:'not a date'},{current:'yes'},{url:{src:'bad'}},{url:'x'.repeat(2049)}]) assert.equal(validExtraSections([{...base,entries:[{...entry,...fields}]}]),false)
  assert.equal(validExtraSections([{...base,type:'interests',format:'skills'}]),false)
})
test('multiple custom sections keep distinct identities and independent saved styles',()=>{
  const {validDesign,getDesign}=require('../client/src/lib/resumeDesign.js')
  const {validateDocument}=require('./validation.js')
  const {portfolioCustomSections}=require('../client/src/lib/portfolioContent.js')
  const key=`custom_${crypto.randomUUID()}`
  const sections=[{type:'custom',heading:'Awards',entries:[entry]},{type:key,format:'standard',heading:'Volunteering',showInPortfolio:true,entries:[{...entry,id:'second-entry'}]}]
  assert.equal(validExtraSections(sections),true)
  assert.equal(validExtraSections([...sections,sections[1]]),false)
  assert.equal(validExtraSections([{...sections[1],type:'custom_invalid'}]),false)
  const design=getDesign({sectionStyles:{custom:{contentLayout:'list'},[key]:{contentLayout:'columns',entryLayout:'full'}}})
  assert.equal(validDesign(design),true)
  assert.doesNotThrow(()=>validateDocument({id:'custom-test',personal:{fullName:'Custom Owner'},name:'Custom resume',kind:'resume',templateId:'essential',extraContent:sections,removedSections:[key],design},'custom-test'))
  assert.equal(portfolioCustomSections({extraContent:sections}).length,1)
  assert.equal(portfolioCustomSections({extraContent:sections,removedSections:[key]}).length,0)
})
test('custom date labels validate bounded text and apply only to a single date',()=>{
  const {customEntryDates}=require('../client/src/lib/contentCatalog.js')
  const dated={...entry,startDate:'2025-11',dateLabel:'Issued'}
  assert.equal(customEntryDates(dated),'Issued 11/2025')
  assert.equal(customEntryDates({...dated,dateLabel:''}),'11/2025')
  assert.equal(customEntryDates({...dated,dateLabel:'custom',customDateLabel:'Received'}),'Received 11/2025')
  assert.equal(customEntryDates({...dated,endDate:'2026-01'}),'11/2025 — 01/2026')
  assert.equal(customEntryDates({...dated,current:true}),'11/2025 — Present')
  assert.equal(customEntryDates({...dated,startDate:''}),'')
  const valid=fields=>validExtraSections([{type:'custom',heading:'Awards',entries:[{...dated,...fields}]}])
  assert.equal(valid({dateLabel:'custom',customDateLabel:'Received'}),true)
  for(const fields of [{dateLabel:'invalid'},{customDateLabel:12},{customDateLabel:'x'.repeat(41)}])assert.equal(valid(fields),false)
})
