// Exercise native keyboard controls rather than writing range values through the DOM.
export async function setControlValue(control, value) {
  if (await control.getAttribute('type') !== 'range') {
    await control.fill(String(value))
    return
  }
  const minimum = Number(await control.getAttribute('min'))
  const maximum = Number(await control.getAttribute('max'))
  const step = Number(await control.getAttribute('step') || 1)
  const number = Number(value)
  if (number < minimum || number > maximum) throw new Error('Requested value is outside the slider range')
  await control.focus()
  await control.press('Home')
  const steps = Math.round((number - minimum) / step)
  for (let index = 0; index < steps; index++) await control.press('ArrowRight')
}

// Users now open a group and scroll to its card; the resume has no shortcut bar.
export async function openGeneralGroup(page,label) {
  const keys={Style:'colors',Templates:'templates',Document:'document',Layout:'layout','Text sizes':'type',Spacing:'spacing',Entries:'entries',Headings:'headings',Font:'font',Colors:'colors',Header:'header',Photo:'photo',Links:'links',Footer:'footer'}
  const general=page.getByRole('button',{name:'General',exact:true})
  if(await general.getAttribute('aria-expanded')!=='true')await general.click()
  const selector=label==='Templates'?'.design-template-row':`[data-design-group="${keys[label]}"]`
  const card=page.locator(selector).first()
  await card.evaluate(element=>{const pane=document.getElementById('editor-content');pane.scrollTo({top:pane.scrollTop+element.getBoundingClientRect().top-pane.getBoundingClientRect().top-16,behavior:'instant'})})
  return card
}
export async function openSectionCard(page,key) {
  const group=page.getByRole('button',{name:'Section customizations',exact:true})
  if(await group.getAttribute('aria-expanded')!=='true')await group.click()
  const card=page.locator(`[data-section-customization="${key}"]`)
  await card.evaluate(element=>{const pane=document.getElementById('editor-content');pane.scrollTo({top:pane.scrollTop+element.getBoundingClientRect().top-pane.getBoundingClientRect().top-16,behavior:'instant'})})
  return card
}
