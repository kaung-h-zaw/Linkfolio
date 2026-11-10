const { test } = require('node:test')
const assert = require('node:assert/strict')
const { validPortfolioImages, portfolioImageSource, resolvePortfolioPortrait } = require('../client/src/lib/portfolioImages.js')

test('portfolio images accept bounded raster uploads and reject executable or untrusted sources', () => {
  const image = 'data:image/jpeg;base64,YWJj'
  assert.equal(validPortfolioImages({portrait:image,cover:'',projects:{'project-1':image}}),true)
  assert.equal(validPortfolioImages(undefined),true)
  assert.equal(validPortfolioImages({portrait:'https://example.com/track.png'}),false)
  assert.equal(validPortfolioImages({cover:'data:image/svg+xml;base64,YWJj'}),false)
  assert.equal(validPortfolioImages({projects:[]}),false)
  assert.equal(validPortfolioImages({projects:{'bad/id':image}}),false)
  assert.equal(validPortfolioImages({portrait:'data:image/jpeg;base64,' + 'A'.repeat(650_000)}),false)
  assert.equal(validPortfolioImages({projects:Object.fromEntries(Array.from({length:21},(_,i)=>['image-'+i,image]))}),false)
  assert.equal(portfolioImageSource('javascript:alert(1)'), '')
})

test('portrait source and visibility are explicit, with no fallback when hidden or custom is empty', () => {
  const resume = {photo:'/images/resume-demo.jpg'}
  const custom = 'data:image/jpeg;base64,YWJj'
  assert.equal(resolvePortfolioPortrait({images:{portraitSource:'resume',portrait:custom}},resume),resume.photo)
  assert.equal(resolvePortfolioPortrait({images:{portraitSource:'custom',portrait:custom}},resume),custom)
  assert.equal(resolvePortfolioPortrait({images:{portraitSource:'custom',portrait:''}},resume),'')
  assert.equal(resolvePortfolioPortrait({images:{showPortrait:false,portrait:custom}},resume),'')
  assert.equal(validPortfolioImages({portraitSource:'resume',showPortrait:false}),true)
  assert.equal(validPortfolioImages({portraitSource:'automatic'}),false)
  assert.equal(validPortfolioImages({showPortrait:'false'}),false)
})
