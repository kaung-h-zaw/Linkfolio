import assert from 'node:assert/strict'
import { paginateColumns } from '../src/lib/resumeColumnPagination.js'
import { sameResumeProfile } from '../src/lib/resumePreviewEqual.js'

// Deterministic geometry doubles check pagination and DOM work, without a browser.
let sectionClones = 0
class Element {
  constructor(tagName, height = 0, column = 'left', document = false) {
    this.tagName = tagName
    this.height = height
    this.column = column
    this.document = document
    this.style = {}
    this.children = []
    this.offsetWidth = 600
  }
  append(...nodes) { for (const node of nodes) {node.remove();node.parent = this;this.children.push(node)} }
  after(node) {this.parent.append(node)}
  remove() {if (this.parent) {this.parent.children = this.parent.children.filter(node => node !== this);this.parent = null}}
  cloneNode(deep) {
    if (deep && this.tagName === 'SECTION') sectionClones++
    const clone = new Element(this.tagName,this.height,this.column,this.document)
    clone.style = {...this.style}
    if (deep) clone.append(...this.children.map(child => child.cloneNode(true)))
    return clone
  }
  querySelectorAll() {return this.children.flatMap(child => [child,...child.querySelectorAll()])}
  naturalHeight() {return this.children.length ? this.children.reduce((sum,child) => sum+child.naturalHeight(),0) : this.height}
  getBoundingClientRect() {
    let top = 0
    if (this.parent?.document) top = this.parent.getBoundingClientRect().top + 10 + (parseInt(this.style.gridRow || '1',10)-1)
    else if (this.parent) {
      top = this.parent.getBoundingClientRect().top
      for (const sibling of this.parent.children) {if (sibling === this) break;top += sibling.naturalHeight()}
    }
    const height = this.naturalHeight() * Number(this.style.zoom || 1)
    return {top,bottom:top+height,height,width:600}
  }
}
globalThis.getComputedStyle = element => ({
  display:element.document ? 'grid' : 'block',gridTemplateColumns:'300px 300px',
  gridColumnStart:element.column === 'right' ? '2' : '1',gridColumnEnd:element.column === 'full' ? '-1' : 'auto',
  marginTop:'0',marginBottom:'0',paddingTop:'10',paddingBottom:'10',
})
function entry(key,column,height,wrapper = false) {
  const element = new Element('SECTION',0,column)
  const heading = new Element('H3',10)
  const body = new Element('P',height)
  if (wrapper) {const group = new Element('DIV');group.append(body);element.append(heading,group)}
  else element.append(heading,body)
  return {unit:{section:key,wrapper:wrapper || undefined},element}
}
function run(batches,pageHeight = 100) {
  const scene = new Element('DIV')
  const source = new Element('ARTICLE',0,'left',true)
  const measure = new Element('ARTICLE',0,'left',true)
  scene.append(source,measure)
  source.append(...batches.flat().map(item => item.element))
  sectionClones = 0
  const pages = paginateColumns({batches:batches.map(batch => batch.map(item => item.unit)),source,measure,pageHeight,bottomInset:10,screenScale:1})
  assert.equal(scene.children.length,2,'temporary measurement sheets are removed')
  return {pages,clones:sectionClones}
}

const full = entry('header','full',10)
const summary = entry('summary','left',20)
const experience = entry('experience','right',40)
const experience2 = entry('experience','right',40)
const skills = entry('skills','left',10)
const independent = run([[full,summary,experience,experience2,skills]])
assert.deepEqual(independent.pages.map(page => page.map(unit => unit.section)),[['header','summary','experience','skills'],['experience']])
assert.equal(independent.clones,6,'only an overflowing entry needs a second clone')

const many = run([Array.from({length:40},() => entry('experience','left',10))],10000)
assert.equal(many.pages.length,1)
assert.equal(many.clones,40,'40 entries create 40 clones, not 820')
const collection = run([[entry('skills','left',20,true),entry('skills','left',20,true)]])
assert.equal(collection.pages.length,1,'collection wrappers merge without losing entries')
assert.equal(collection.pages[0].length,2)
const manualBreak = run([[entry('summary','left',10)],[entry('education','left',10)]])
assert.equal(manualBreak.pages.length,2,'manual page breaks are preserved')
const oversized = run([[entry('experience','right',1000)]])
assert.ok(oversized.pages[0][0].zoom > 0 && oversized.pages[0][0].zoom < 1,'oversized entries remain scaled to the paper')
const content = {personal:{fullName:'Test'},experienceSection:{entries:[]}}
assert.equal(sameResumeProfile({...content,design:{color:'#000000'}},{...content,design:{color:'#137763'}},true),true)
assert.equal(sameResumeProfile({...content,personal:{fullName:'Changed'}},content,true),false)
console.log('Passed: independent columns, overflow, page breaks, collections, oversized entries, and thumbnail memoization.')
console.log('40-entry measurement case: 40 section clones; previous rebuilding pattern: 820.')
