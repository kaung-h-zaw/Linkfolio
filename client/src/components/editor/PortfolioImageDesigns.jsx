import { useState } from 'react'
import { portraitStylePresets, imageFrameOptions, imageEffectOptions } from '../../lib/portfolioDesign'
import { resolvePortfolioPortrait } from '../../lib/portfolioImages'
import Icon from '../Icon'

export default function PortfolioImageDesigns({section,settings,profile,design,select,range,onChange}) {
  const portrait = resolvePortfolioPortrait(settings,profile?.personal || {})
  const overrides = settings.design || {}
  const [customSize, setCustomSize] = useState(false)
  const sizes = {160:'Small',240:'Medium',320:'Large'}
  const sizeChoice = customSize ? 'custom' : overrides.portraitSize === undefined ? 'template' : sizes[design.portraitSize] ? String(design.portraitSize) : 'custom'
  const updateSize = (value) => onChange({...settings,design:{...overrides,portraitSize:value}})
  return <details className="portfolio-image-options border-t border-line pt-4"><summary className="cursor-pointer text-sm font-semibold">Image styling</summary>
    <div className="mt-4 space-y-5">
      {section !== 'projects' && <><fieldset><legend className="mb-3 text-sm font-semibold">Personal photo designs</legend>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">{portraitStylePresets.map((preset) => <button type="button" key={preset.id} aria-label={`Personal photo design: ${preset.name}`} aria-pressed={design.portraitShape === preset.shape && design.portraitFrame === preset.frame} onClick={() => onChange({...settings,design:{...overrides,portraitShape:preset.shape,portraitFrame:preset.frame,portraitEffect:'natural'}})} className={`portfolio-image-style-tile min-w-0 rounded border bg-white p-2 text-center ${design.portraitShape === preset.shape && design.portraitFrame === preset.frame ? 'border-accent ring-1 ring-accent' : 'border-line'}`} data-portrait-shape={preset.shape} data-portrait-frame={preset.frame}>
          <span className="flex h-24 items-center justify-center overflow-visible">{portrait ? <img src={portrait} alt="" className="portfolio-portrait" /> : <span className="portfolio-portrait grid place-items-center bg-slate-100 text-slate-400"><Icon name="user" className="h-8 w-8" /></span>}</span>
          <span className="mt-2 block text-xs">{preset.name}</span>
        </button>)}</div>
        {!portrait && <p className="mt-3 text-xs leading-5 text-muted">Add or turn on your personal photo in Content to preview these designs with your image.</p>}
      </fieldset>
      <div className="space-y-4 border-t border-line pt-4">
        <label className="block text-sm font-medium">Personal photo size
          <select aria-label="Personal photo size" value={sizeChoice} onChange={(event) => {
            const value = event.target.value
            setCustomSize(value === 'custom')
            if (value === 'template') {
              const nextDesign = {...overrides}
              delete nextDesign.portraitSize
              onChange({...settings,design:nextDesign})
            } else if (value !== 'custom') updateSize(Number(value))
          }} className="mt-2 min-h-11 w-full rounded border border-line bg-white px-3 text-sm font-normal">
            <option value="template">Template default</option>
            {Object.entries(sizes).map(([value,label]) => <option key={value} value={value}>{label}</option>)}
            <option value="custom">Custom size</option>
          </select>
        </label>
        {sizeChoice === 'custom' && <label className="block text-sm font-medium">Custom photo size (px)
          <input type="number" aria-label="Custom photo size (px)" min="100" max="360" step="1" defaultValue={design.portraitSize} onChange={(event) => {
            const value = event.target.valueAsNumber
            if (Number.isInteger(value) && value >= 100 && value <= 360) updateSize(value)
          }} onBlur={(event) => {
            const value = Math.round(Math.min(360,Math.max(100,event.target.valueAsNumber || design.portraitSize)))
            event.target.value = value
            updateSize(value)
          }} className="mt-2 min-h-11 w-full rounded border border-line bg-white px-3 text-sm font-normal" />
          <span className="mt-2 block text-xs font-normal text-muted">Choose a size from 100 to 360 px.</span>
        </label>}
      </div>
      </>}
      {section !== 'hero' && <div className="space-y-4 border-t border-line pt-4"><h3 className="text-sm font-semibold">Project images</h3>
        {select('imageRatio','Project image proportions',{template:'Template default',landscape:'Landscape',square:'Square',portrait:'Portrait',natural:'Original proportions'})}
        {select('imageFit','Project image fit',{cover:'Fill and crop',contain:'Show whole image'})}
        {select('imageFrame','Project image frame',imageFrameOptions)}
        {select('imagePosition','Project image focal point',{center:'Center',top:'Top',bottom:'Bottom',left:'Left',right:'Right'})}
        {select('imageEffect','Project image color effect',imageEffectOptions)}
        {range('projectImageRadius','Project image corners',0,32)}
      </div>}
      {section !== 'projects' && <div className="space-y-4 border-t border-line pt-4">{select('heroPosition','Personal photo focal point',{center:'Center',top:'Top',bottom:'Bottom',left:'Left',right:'Right'})}
      </div>}
    </div>
  </details>
}
