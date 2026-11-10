const test = require('node:test')
const assert = require('node:assert/strict')
const { validPortfolioDesign, portfolioOrder } = require('../client/src/lib/portfolioDesign.js')
const { validPortfolio, defaultPortfolio } = require('../client/src/lib/portfolio.js')

test('shared design accepts bounded settings and rejects malformed saved data', () => {
  const design = { font:'serif',palette:'dark',bodySize:18,sectionOrder:['projects','about'],projectColumns:'2',portraitShape:'circle' }
  assert.equal(validPortfolio({...defaultPortfolio,design}),true)
  for (const invalid of [{bodySize:999},{font:'script'},{background:'url(x)'},{sectionOrder:['about','about']},{sectionOrder:['private']},{projectColumns:2},{unknown:true},[],null]) {
    assert.ok(!validPortfolioDesign(invalid))
    assert.ok(!validPortfolio({...defaultPortfolio,design:invalid}))
  }
  assert.deepEqual(portfolioOrder({projectsFirst:false},design),['projects','about','experience','education','skills','certifications','languages','custom','contact'])
})

test('section headings and legacy layout migration stay valid across the nine templates', () => {
  const { validSectionLayouts } = require('../client/src/lib/portfolioSections.js')
  const { getPortfolioTemplate, sourcedPortfolioTemplates, legacyPortfolioReplacement } = require('../client/src/lib/portfolioTemplates.js')
  assert.equal(validPortfolio({...defaultPortfolio,sectionTitles:{projects:'Selected projects'}}),true)
  for (const sectionTitles of [null,[],{projects:123},{projects:'x'.repeat(81)},{unknown:'Unknown'}]) assert.ok(!validPortfolio({...defaultPortfolio,sectionTitles}))
  assert.equal(validSectionLayouts({about:'panel',contact:'panel',certifications:'cards',languages:'list'}),true)
  for (const id of Object.keys(legacyPortfolioReplacement)) assert.ok(sourcedPortfolioTemplates.some((template) => template.id === getPortfolioTemplate(id).id))
})

test('photo presets and image settings validate without accepting arbitrary styles', () => {
  const { portraitStylePresets } = require('../client/src/lib/portfolioDesign.js')
  assert.equal(portraitStylePresets.length,12)
  for (const preset of portraitStylePresets) assert.equal(validPortfolioDesign({portraitShape:preset.shape,portraitFrame:preset.frame,portraitEffect:'natural',portraitSize:300,imageFrame:'outline',imageEffect:'grayscale',imagePosition:'top',coverRatio:'banner'}),true)
  for (const invalid of [{portraitSize:999},{portraitFrame:'url(x)'},{imageEffect:'script'},{imagePosition:'invalid'},{coverRatio:'unknown'}]) assert.ok(!validPortfolioDesign(invalid))
})
