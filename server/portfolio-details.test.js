const test=require('node:test')
const assert=require('node:assert/strict')
const {validDetailPages,portfolioCustomSections,portfolioDetailEntries}=require('../client/src/lib/portfolioContent.js')
const {portfolioOrder}=require('../client/src/lib/portfolioDesign.js')
const {textDocument}=require('../client/src/lib/summary.js')
const {hydrateProfile}=require('../client/src/lib/profile.js')
test('detail page settings validate entry keys, flags and bounded raster galleries',()=>{
  assert.equal(validDetailPages(undefined),true)
  assert.equal(validDetailPages({'projects:one':{enabled:true,title:'Project story',description:'My own project details',subtitle:'Design and development',url:'https://example.com',github:''}}),true)
  for(const config of [{description:7},{description:'x'.repeat(20001)},{url:'javascript:alert(1)'},{title:'x'.repeat(161)}]) assert.equal(validDetailPages({'projects:one':{enabled:true,...config}}),false)
  assert.equal(validDetailPages({'projects:one':{enabled:true,images:['/images/portfolio-desk.jpg']}}),true)
  for(const value of [null,[],{'private:one':{enabled:true}},{'custom:one':{enabled:'yes'}},{'projects:one':{enabled:true,html:'<script>'}},{'custom:one':{enabled:true,images:['https://unknown.example/image.svg']}},{'custom:one':{enabled:true,images:Array(5).fill('/images/portfolio-desk.jpg')}}]) assert.equal(validDetailPages(value),false)
})
test('custom sections require portfolio opt-in and remove invisible entries and hidden skill metadata',()=>{
  const section={type:'custom',heading:'Volunteering',showInResume:false,showInPortfolio:true,entries:[{id:'visible',name:'Mentor',content:textDocument('Public work'),visible:true,subtitle:'Organisation'},{id:'secret',name:'Hidden',content:textDocument('Secret'),visible:false}]}
  const profile=hydrateProfile({extraContent:[section]})
  assert.equal(portfolioCustomSections(profile)[0].entries.length,1)
  assert.equal(portfolioDetailEntries(profile,{}).some((item)=>item.key==='custom:visible'),true)
  assert.deepEqual(portfolioDetailEntries(profile,{custom:false}),[])
  assert.deepEqual(portfolioCustomSections({...profile,extraContent:[{...section,showInPortfolio:false}]}),[])
  assert.deepEqual(portfolioCustomSections({...profile,removedSections:['custom']}),[])
  const skills=portfolioCustomSections({...profile,extraContent:[{...section,format:'skills'}]})
  assert.equal(skills[0].entries[0].subtitle,undefined)
  assert.equal(section.entries[0].subtitle,'Organisation')
})
test('section order is consistent across templates',()=>{
  const design={sectionOrder:['custom','projects','about']}
  assert.deepEqual(portfolioOrder({projectsFirst:true},design),portfolioOrder({projectsFirst:false},design))
})
