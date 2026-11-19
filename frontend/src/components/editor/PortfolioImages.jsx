import Icon from '../Icon'
import { useId, useRef, useState } from 'react'
import { portfolioImageSource, readPortfolioImage, resolvePortfolioPortrait } from '../../lib/portfolioImages'

export function ImageField({ label, help, value, onChange }) {
  const dialog = useRef(null)
  const fileInput = useRef(null)
  const headingId = useId()
  const [error,setError] = useState('')
  const [busy,setBusy] = useState(false)
  const [dragging,setDragging] = useState(false)
  const [pending,setPending] = useState('')
  const source = portfolioImageSource(value)
  async function prepare(file) {
    if (!file || busy) return
    setError(''); setBusy(true); setPending('')
    try { setPending(await readPortfolioImage(file)) }
    catch (error) { setError(error.message) }
    finally { setBusy(false) }
  }
  return <div className="portfolio-image-field rounded-md border border-line p-4">
    <h3 className="text-sm font-medium">{label}</h3>
    <p className="mt-2 text-xs leading-5 text-muted">{help}</p>
    <div className="mt-3 flex flex-wrap items-center gap-3">
      {source && <img src={source} alt={`${label} preview`} className="h-20 w-28 rounded object-cover" />}
      <button type="button" className="button button-outline" aria-label={`${source ? 'Change' : 'Add'} ${label.toLowerCase()}`} onClick={() => { setError(''); setPending(''); setDragging(false); dialog.current.showModal() }}>{source ? 'Change image' : 'Add image'}</button>
      {source && <button type="button" aria-label={`Remove ${label.toLowerCase()}`} title={`Remove ${label.toLowerCase()}`} onClick={() => onChange('')} className="button button-outline editor-icon-button"><Icon name="trash" className="h-4 w-4" /></button>}
    </div>
    <dialog ref={dialog} aria-labelledby={headingId} className="portfolio-upload-dialog" onCancel={(event) => { if (busy) event.preventDefault() }}>
      <h2 id={headingId}>Add {label.toLowerCase()}</h2>
      <p className="mt-2 text-sm text-muted">Choose a photo or screenshot from your device.</p>
      <div className={`portfolio-upload-dropzone ${dragging ? 'is-dragging' : ''}`} onDragOver={(event) => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); prepare(event.dataTransfer.files[0]) }}>
        <p>Drag and drop an image here</p>
        <span className="text-sm text-muted">or</span>
        <button type="button" className="button button-outline" disabled={busy} onClick={() => fileInput.current.click()}>Choose image</button>
        <input ref={fileInput} hidden type="file" aria-label={`Choose ${label.toLowerCase()}`} accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(event) => { const file = event.target.files[0]; event.target.value = ''; prepare(file) }} />
        <p className="text-xs text-muted">JPG, PNG or WebP · Up to 5 MB</p>
      </div>
      {pending && <img className="portfolio-upload-preview" src={pending} alt="Selected image preview" />}
      {busy && <p role="status" className="mt-3 text-sm">Preparing image…</p>}
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      <div className="mt-5 flex justify-end gap-3">
        <button type="button" className="button button-outline" disabled={busy} onClick={() => dialog.current.close()}>Cancel</button>
        <button type="button" className="button button-green" disabled={!pending || busy} onClick={() => { onChange(pending); dialog.current.close() }}>Use image</button>
      </div>
    </dialog>
  </div>
}
export default function PortfolioImages({ settings, onChange, personal = {} }) {
  const images = settings.images || {}
  const set = (key, value) => onChange({ ...settings, images: { ...images, [key]: value } })
  const mode = images.portraitSource || (images.portrait ? 'custom' : 'resume')
  const portrait = resolvePortfolioPortrait(settings,personal)
  return <section className="space-y-4 rounded-md border border-line bg-white p-5">
    <div><h2 className="font-semibold">Portfolio images</h2><p className="mt-2 text-xs leading-5 text-muted">Add an optional personal photo. Add project images in each project’s detail page.</p></div>
    <fieldset className="space-y-4 rounded-md border border-line p-4">
      <legend className="px-1 text-sm font-semibold">Personal photo</legend>
      <label className="flex min-h-10 items-center gap-3 text-sm"><input type="checkbox" checked={images.showPortrait !== false} onChange={(event) => set('showPortrait',event.target.checked)} className="accent-accent" />Show personal photo</label>
      {images.showPortrait !== false ? <>
        <div className="flex flex-wrap gap-4">{[['resume','Use resume photo'],['custom','Use custom photo']].map(([value,label]) => <label key={value} className="flex min-h-10 items-center gap-2 text-sm"><input type="radio" name="portfolio-portrait-source" value={value} checked={mode === value} onChange={() => set('portraitSource',value)} className="accent-accent" />{label}</label>)}</div>
        {mode === 'resume' && <>
          <p className="text-xs leading-5 text-muted">{portrait ? 'Uses the photo in Personal Details.' : 'Add a resume photo in Personal Details, or choose a custom photo here.'}</p>
          {portrait && <img src={portrait} alt="Active personal photo" className="h-20 w-20 rounded-full object-cover" />}
        </>}
        {mode === 'custom' && <ImageField label="Portrait image" help="Choose a photo for your portfolio." value={images.portrait} onChange={(value) => onChange({ ...settings, images: { ...images, portrait: value, portraitSource: 'custom' } })} />}
      </> : <p className="text-xs text-muted">Your personal photo is hidden. Your uploaded image is kept for when you turn it on again.</p>}
    </fieldset>
  </section>
}
