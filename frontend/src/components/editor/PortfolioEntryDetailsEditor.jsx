import { useEffect, useRef, useState } from 'react'
import Icon from '../Icon'
import { portfolioDetailEntries } from '../../lib/portfolioContent'
import { summaryText } from '../../lib/summary'
import { profileLinkHref } from '../../lib/profileLinks'
import { ImageField } from './PortfolioImages'

function DetailForm({item,config,onSave,onClose}) {
  const dialog=useRef(null)
  const [draft,setDraft]=useState(()=>({title:config.title??item.title,subtitle:config.subtitle??item.entry.subtitle??'',description:config.description??summaryText(item.entry.content||{}),url:config.url??item.entry.url??'',github:config.github??item.entry.github??'',images:config.images||[]}))
  const [error,setError]=useState('')
  const set=(key,value)=>setDraft(current=>({...current,[key]:value}))
  useEffect(()=>{
    const element=dialog.current,previous=document.activeElement,overflow=document.body.style.overflow
    element.showModal();document.body.style.overflow='hidden'
    return()=>{element.close();document.body.style.overflow=overflow;previous?.focus({preventScroll:true})}
  },[])
  function submit(event) {
    event.preventDefault()
    if(!draft.title.trim()){setError('Add a page title.');return}
    if([draft.url,draft.github].some(url=>url.trim()&&!profileLinkHref(url))){setError('Enter a valid web address.');return}
    const patch={...draft,enabled:true,title:draft.title.trim()}
    // Keep formatted resume content when the description has not been edited.
    if(config.description===undefined&&draft.description===summaryText(item.entry.content||{}))delete patch.description
    const failure=onSave(patch)
    if(failure)setError(failure)
    else onClose()
  }
  return <dialog ref={dialog} aria-label={config.enabled?'Edit detail page':'Add detail page'} className="portfolio-detail-dialog" onCancel={event=>{event.preventDefault();onClose()}}>
    <div className="portfolio-detail-form-heading"><div><p className="text-xs text-muted">{item.title}</p><h2>{config.enabled?'Edit detail page':'Add detail page'}</h2></div><button type="button" className="entry-form-action" aria-label="Close detail page" onClick={onClose}><Icon name="close" className="h-4 w-4"/></button></div>
    <form onSubmit={submit} className="portfolio-detail-form">
      <label>Page title<input autoFocus value={draft.title} maxLength={160} onChange={event=>set('title',event.target.value)}/></label>
      <label>Subtitle <span className="text-muted font-normal">(optional)</span><input value={draft.subtitle} maxLength={300} onChange={event=>set('subtitle',event.target.value)}/></label>
      <label>Description<textarea aria-label="Description" rows={7} value={draft.description} maxLength={20000} placeholder="Share what you did, how it worked, and the result." onChange={event=>set('description',event.target.value)}/></label>
      <fieldset className="portfolio-detail-form-images"><legend>Images <span className="text-muted font-normal">(optional)</span></legend>
        {draft.images.map((src,index)=><ImageField key={index} label={`Detail image ${index+1}: ${item.title}`} value={src} onChange={value=>set('images',value?draft.images.map((image,i)=>i===index?value:image):draft.images.filter((_,i)=>i!==index))}/>)}
        {draft.images.length<4&&<ImageField key={`add-${draft.images.length}`} label={`Detail image: ${item.title}`} help={item.kind==='projects'?'Up to 4 images. The first image is used as the project card cover.':'Up to 4 photos or screenshots.'} value="" onChange={value=>value&&set('images',[...draft.images,value])}/>}
      </fieldset>
      <details className="portfolio-detail-form-links"><summary>Links <span className="text-muted font-normal">(optional)</span></summary><div><label>Website<input value={draft.url} maxLength={2048} placeholder="https://" onChange={event=>set('url',event.target.value)}/></label><label>Source code<input value={draft.github} maxLength={2048} placeholder="https://github.com/" onChange={event=>set('github',event.target.value)}/></label></div></details>
      {error&&<p role="alert" className="text-sm text-red-700">{error}</p>}
      <div className="portfolio-detail-form-footer"><button type="button" className="button button-outline" onClick={onClose}>Cancel</button><button className="button button-green"><Icon name="check" className="h-4 w-4"/>Done</button></div>
    </form>
  </dialog>
}
function DetailPagePicker({entries,onChoose,onClose}) {
  const dialog=useRef(null)
  useEffect(()=>{
    const element=dialog.current,previous=document.activeElement
    element.showModal()
    return()=>{element.close();previous?.focus({preventScroll:true})}
  },[])
  return <dialog ref={dialog} aria-label="Choose detail page content" className="portfolio-detail-dialog portfolio-detail-picker" onCancel={event=>{event.preventDefault();onClose()}}>
    <div className="portfolio-detail-form-heading"><div><p className="text-xs text-muted">Detail pages</p><h2>Choose what to add</h2></div><button type="button" className="entry-form-action" aria-label="Close chooser" onClick={onClose}><Icon name="close" className="h-4 w-4"/></button></div>
    <div className="portfolio-detail-picker-list">{entries.map(item=><button key={item.key} type="button" className="portfolio-detail-picker-option" onClick={()=>onChoose(item.key)}><Icon name={item.kind==='projects'?'folder':'file'} className="h-5 w-5 text-muted"/><span><strong>{item.title}</strong><small>{item.kind==='projects'?'Project':'Portfolio entry'}</small></span><Icon name="arrow" className="h-4 w-4"/></button>)}</div>
  </dialog>
}
export default function PortfolioEntryDetailsEditor({profile,settings,onChange}) {
  const [editing,setEditing]=useState(null)
  const [choosing,setChoosing]=useState(false)
  const entries=portfolioDetailEntries(profile,settings)
  if(!entries.length)return null
  const enabled=entries.filter(item=>settings.detailPages?.[item.key]?.enabled)
  const available=entries.filter(item=>!settings.detailPages?.[item.key]?.enabled)
  function update(key,patch) {
    const detailPages={...settings.detailPages,[key]:{enabled:false,...settings.detailPages?.[key],...patch}}
    if(JSON.stringify(detailPages).length>=2_000_000)return 'The images are too large together. Remove an image or choose smaller images.'
    onChange({...settings,detailPages})
  }
  const current=entries.find(item=>item.key===editing)
  return <section className="resume-design-card portfolio-detail-pages" aria-label="Detail pages">
    <h2 className="font-semibold">Detail pages</h2>
    <div className="portfolio-detail-entry-list">{enabled.map(item=>{
      const config=settings.detailPages?.[item.key]||{}
      return <div key={item.key} className="portfolio-detail-entry-row"><Icon name={item.kind==='projects'?'folder':'file'} className="h-5 w-5 text-muted"/><span className="min-w-0 flex-1"><strong>{item.title}</strong><small>Detail page added</small></span><button type="button" aria-label={`Edit details for ${item.title}`} className="button button-outline" onClick={()=>setEditing(item.key)}><Icon name="edit" className="h-4 w-4"/>Edit details</button><button type="button" className="entry-form-action entry-form-delete" aria-label={`Remove detail page for ${item.title}`} title="Remove detail page" onClick={()=>update(item.key,{enabled:false})}><Icon name="trash" className="h-4 w-4"/></button></div>
    })}</div>
    {available.length>0&&<button type="button" className="button button-outline portfolio-detail-add" onClick={()=>setChoosing(true)}><Icon name="plus" className="h-4 w-4"/>Add detail page</button>}
    {choosing&&<DetailPagePicker entries={available} onChoose={key=>{setChoosing(false);setEditing(key)}} onClose={()=>setChoosing(false)}/>}
    {current&&<DetailForm key={current.key} item={current} config={settings.detailPages?.[current.key]||{}} onClose={()=>setEditing(null)} onSave={patch=>update(current.key,patch)}/>}
  </section>
}
