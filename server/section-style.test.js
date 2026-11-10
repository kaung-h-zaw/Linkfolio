const test = require('node:test')
const assert = require('node:assert/strict')
const { validDesign, getDesign, alignHeaderPhoto } = require('../client/src/lib/resumeDesign.js')
const { validPortfolioDesign } = require('../client/src/lib/portfolioDesign.js')

test('section overrides accept safe appearance settings and preserve legacy documents', () => {
  assert.equal(validDesign(getDesign()), true)
  assert.equal(validPortfolioDesign({}), true)
  const sectionStyles = { experience: { title: 'Work history', hidden: false, fontSize: 16, headingSize: 20, lineHeight: 1.8, spacing: 30, accent: '#123abc' } }
  assert.equal(validDesign(getDesign({ sectionStyles })), true)
  assert.equal(validPortfolioDesign({ sectionStyles }), true)
  for (const invalid of [null, [], { experience: null }, { experience: { fontSize: 99 } }, { experience: { accent: 'url(x)' } }, { experience: { hidden: 'true' } }, { experience: { title: 'x'.repeat(81) } }, { experience: { arbitrary: true } }]) {
    assert.equal(validDesign(getDesign({ sectionStyles: invalid })), false)
    assert.equal(validPortfolioDesign({ sectionStyles: invalid }), false)
  }
  assert.equal(validPortfolioDesign({ sectionStyles: { unknown: {} } }), false)
})

test('resume content layouts are limited to the sections that support them', () => {
  assert.equal(validDesign(getDesign({sectionStyles:{summary:{contentLayout:'bullets'},skills:{contentLayout:'tags'}}})),true)
  for (const sectionStyles of [{experience:{contentLayout:'tags'}},{summary:{contentLayout:'columns'}},{skills:{contentLayout:'bullets'}},{skills:{contentLayout:'script'}}]) {
    assert.equal(validDesign(getDesign({sectionStyles})),false)
  }
})

test('summary paragraph presentation preserves marks and leaves original content unchanged', () => {
  const {summaryAsParagraph}=require('../client/src/lib/resumeSectionLayouts.js')
  const {textDocument,summaryText}=require('../client/src/lib/summary.js')
  const content=textDocument('First paragraph.\nSecond paragraph.')
  content.content[0].content[0].marks=[{type:'bold'}]
  const before=JSON.stringify(content)
  const presented=summaryAsParagraph(content)
  assert.equal(presented.content[0].type,'paragraph')
  assert.equal(presented.content.length,1)
  assert.deepEqual(presented.content[0].content[0].marks,[{type:'bold'}])
  assert.equal(summaryText(presented),summaryText(content))
  assert.equal(JSON.stringify(content),before)
})

test('resume column widths and header positions are bounded and optional', () => {
  for (const headerPosition of ['top','left','right']) {
    for (const columnRatio of [30,50,70]) assert.equal(validDesign(getDesign({headerPosition,columnRatio})),true)
  }
  for (const columnRatio of [0,29,71,Infinity,'50']) assert.equal(validDesign(getDesign({columnRatio})),false)
  for (const headerPosition of ['bottom','',null]) assert.equal(validDesign(getDesign({headerPosition})),false)
})

test('large resume names remain within a safe saved size range', () => {
  for (const nameSize of [24,44,52,80]) assert.equal(validDesign(getDesign({nameSize})),true)
  for (const nameSize of [23,81,Infinity,'52']) assert.equal(validDesign(getDesign({nameSize})),false)
})

test('date and location order accepts only the two supported sequences', () => {
  for (const metadataOrder of ['date-location','location-date']) assert.equal(validDesign(getDesign({metadataOrder})),true)
  for (const metadataOrder of ['date','location','',null]) assert.equal(validDesign(getDesign({metadataOrder})),false)
})

test('heading choices support overlines and bounded capitalization modes', () => {
  assert.equal(validDesign(getDesign({headings:'overline',headingCase:'capitalize'})),true)
  assert.equal(validDesign(getDesign({headingCase:'uppercase'})),true)
  for(const headingCase of ['',null,'random']) assert.equal(validDesign(getDesign({headingCase})),false)
})

test('resume header and photo settings validate supported choices',()=>{
  const settings={contactArrangement:'columns',contactIcons:'soft',nameWeight:'bold',titleStyle:'italic',titlePosition:'inline',photoPosition:'left',photoSize:'xl',photoShape:'portrait',photoShow:true,photoGrayscale:true}
  assert.equal(validDesign(getDesign(settings)),true)
  for(const key of Object.keys(settings)) assert.equal(validDesign(getDesign({...settings,[key]:'unsupported'})),false,key)
})


test('centered resume headers normalize side photos without changing the stored input',()=>{
  const original=getDesign({header:'center',photoPosition:'right'})
  assert.equal(alignHeaderPhoto(original).photoPosition,'top')
  assert.equal(original.photoPosition,'right')
  assert.equal(alignHeaderPhoto({...original,header:'template'},{defaults:{header:'center'}}).photoPosition,'top')
  assert.equal(alignHeaderPhoto({...original,header:'left'}).photoPosition,'right')
  assert.equal(alignHeaderPhoto({...original,header:'left',photoPosition:'top'}).photoPosition,'right')
})

test('resume link and footer options accept bounded saved settings',()=>{
  const settings={linkBlue:true,linkIcon:true,linkIconStyle:'external',footerPages:true,footerEmail:true,footerName:true}
  assert.equal(validDesign(getDesign(settings)),true)
  for(const key of Object.keys(settings)) assert.equal(validDesign(getDesign({...settings,[key]:'unsupported'})),false,key)
})

test('section controls validate summary, title ordering and collection display settings',()=>{
  assert.equal(validDesign(getDesign({sectionStyles:{summary:{summaryInHeader:true,hideHeading:true},experience:{titleOrder:'subtitle-title'},education:{titleOrder:'title-subtitle'},skills:{contentLayout:'level',columns:4},languages:{contentLayout:'tags',columns:3},certifications:{contentLayout:'compact'}}})),true)
  for(const sectionStyles of [{summary:{summaryInHeader:'yes'}},{skills:{hideHeading:true}},{languages:{columns:5}},{certifications:{contentLayout:'level'}},{summary:{titleOrder:'subtitle-title'}},{experience:{titleOrder:'wrong'}}])assert.equal(validDesign(getDesign({sectionStyles})),false)
})

test('collection refinements accept only supported options and section types',()=>{
  assert.equal(validDesign(getDesign({sectionStyles:{skills:{rowSpacing:'spacious',rowBullets:true,compactSeparator:'comma',subinfoStyle:'brackets',levelDisplay:'dots'},languages:{levelDisplay:'text'},certifications:{subinfoStyle:'colon'}}})),true)
  for(const sectionStyles of [{skills:{rowSpacing:'wide'}},{languages:{rowBullets:'yes'}},{experience:{compactSeparator:'pipe'}},{certifications:{levelDisplay:'bar'}},{skills:{subinfoStyle:'html'}}])assert.equal(validDesign(getDesign({sectionStyles})),false)
})
test('custom skill groups accept collection controls and legacy level styles resolve to Grid',()=>{
  const key=`custom_${crypto.randomUUID()}`
  for(const contentLayout of ['columns','list','compact','tags'])assert.equal(validDesign(getDesign({sectionStyles:{[key]:{contentLayout,columns:3,rowSpacing:'spacious',rowBullets:true,compactSeparator:'pipe',subinfoStyle:'colon'}}})),true)
  const input={sectionStyles:{skills:{contentLayout:'level'},languages:{contentLayout:'level',levelDisplay:'dots'}}}
  const normalized=getDesign(input)
  assert.equal(normalized.sectionStyles.skills.contentLayout,'columns')
  assert.equal(normalized.sectionStyles.languages.contentLayout,'columns')
  assert.equal(input.sectionStyles.languages.contentLayout,'level')
})
