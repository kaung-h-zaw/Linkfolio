import Icon from '../Icon'
import { useId, useState } from 'react'

export function NumberControl({ label, ariaLabel = label, value, min, max, step = 1, unit = 'px', onChange, hint }) {
  const id = useId()
  const [draft, setDraft] = useState(null)
  const clamp = (number) => Number(Math.min(max, Math.max(min, number)).toFixed(2))
  const commit = (number) => { setDraft(null); onChange(clamp(number)) }
  return <div className="appearance-number-row">
    <label htmlFor={id}>{label}{hint && <span className="appearance-hint">{hint}</span>}</label>
    <div className="appearance-stepper">
      <button type="button" aria-label={`Decrease ${ariaLabel}`} disabled={value <= min} onClick={() => commit(value - step)} title={`Decrease ${ariaLabel}`}><Icon name="minus" className="h-4 w-4" /></button>
      <div><input id={id} aria-label={ariaLabel} type="number" inputMode={step < 1 ? 'decimal' : 'numeric'} min={min} max={max} step={step} value={draft ?? value} onChange={(event) => {
        setDraft(event.target.value)
        const number = event.target.valueAsNumber
        if (Number.isFinite(number) && number >= min && number <= max) onChange(number)
      }} onBlur={() => { if (draft !== null && draft.trim() && Number.isFinite(Number(draft))) commit(Number(draft)); else setDraft(null) }} onKeyDown={(event) => {
        if (event.key === 'Enter') event.currentTarget.blur()
        if (event.key === 'Escape') { event.preventDefault(); setDraft(null) }
      }} />{unit && <span aria-hidden="true">{unit}</span>}</div>
      <button type="button" aria-label={`Increase ${ariaLabel}`} disabled={value >= max} onClick={() => commit(value + step)} title={`Increase ${ariaLabel}`}><Icon name="plus" className="h-4 w-4" /></button>
    </div>
  </div>
}

export function SpacingControl({ label, ariaLabel = label, value, onChange, options, min = 0, max = 100, step = 1, unit = 'px' }) {
  const matched = options.some(([, number]) => Math.abs(value - number) < .001)
  return <fieldset className="appearance-spacing">
    <legend>{label}</legend>
    <div className="appearance-spacing-choices">{options.map(([name, number], index) => {
      const selected = Math.abs(value - number) < .001
      return <button type="button" key={name} aria-label={`${ariaLabel}: ${name}`} aria-pressed={selected} onClick={() => onChange(number)}>
        <span className="appearance-choice-check" aria-hidden="true">{selected && <Icon name="check" className="h-4 w-4" />}</span>
        <span className="appearance-lines" aria-hidden="true" style={{ gap: 3 + index * 4 }}><i /><i /><i /></span>
        <strong>{name}</strong><small>{number}{unit ? ` ${unit}` : '×'}</small>
      </button>
    })}</div>
    <div className="appearance-custom-value"><NumberControl label={matched ? 'Fine-tune' : 'Custom value'} ariaLabel={ariaLabel} value={value} min={min} max={max} step={step} unit={unit} onChange={onChange} /></div>
  </fieldset>
}

const appearanceColors = [
  ['Forest', '#137763'], ['Ocean', '#245778'], ['Slate', '#394653'],
  ['Terracotta', '#91472f'], ['Burgundy', '#843b4d'], ['Olive', '#59632d'],
  ['Ink', '#1e293b'], ['White', '#ffffff'],
]

export function ColorControl({ label, value, onChange, namesOnly = false, hint }) {
  const [draft, setDraft] = useState(null)
  const current = value || '#137763'
  const known = appearanceColors.find(([, hex]) => Boolean(value) && hex === current.toLowerCase())
  const selectedName = value ? known?.[0] || 'Custom color' : 'Template default'
  return <fieldset className="appearance-colors">
    <legend>{label}</legend>
    <div className="appearance-color-caption"><span>{hint || selectedName}</span><code>{value ? current.toUpperCase() : 'AUTO'}</code></div>
    <div className="appearance-swatches">{appearanceColors.map(([name, hex]) => {
      const selected = Boolean(value) && hex === current.toLowerCase()
      return <button key={name} type="button" aria-label={namesOnly ? name : `${label}: ${name}`} aria-pressed={selected} onClick={() => { setDraft(null); onChange(hex) }}>
        <span className="appearance-swatch-color" style={{ background: hex }} aria-hidden="true">{selected && <Icon name="check" className="h-4 w-4" style={{color:hex === '#ffffff' ? '#1e293b' : '#fff'}} />}</span>
        <span className="appearance-swatch-name">{name}</span>
      </button>
    })}</div>
    <label className="appearance-custom-color"><span>Custom color <small>Enter a HEX code</small></span><span className="appearance-hex"><span aria-hidden="true" style={{ background: /^#[0-9a-f]{6}$/i.test(draft ?? current) ? draft ?? current : current }} /><input type="text" aria-label={`${label} hex`} spellCheck={false} maxLength={7} placeholder="#137763" value={draft ?? current} onChange={(event) => {
      const text = event.target.value
      setDraft(text)
      const hex = text.startsWith('#') ? text : `#${text}`
      if (/^#[0-9a-f]{6}$/i.test(hex)) onChange(hex.toLowerCase())
    }} onBlur={() => setDraft(null)} /></span></label>
  </fieldset>
}
