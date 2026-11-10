import { useId, useRef } from 'react'
import Icon from '../Icon'

export default function SliderControl({ label, ariaLabel = label, value, min, max, rangeMax = max, step = 1, unit = 'px', recommended, formatValue, onChange, children }) {
  const id = useId()
  const pointer = useRef(false)
  const trackMax = Math.min(max, Math.max(rangeMax, Math.ceil(value / 4) * 4))
  const clamp = (number) => Number(Math.min(max, Math.max(min, number)).toFixed(2))
  const tickCount = Math.min(9, Math.round((trackMax - min) / step) + 1)
  const ticks = [...new Set([...Array.from({ length:tickCount }, (_, index) => clamp(Math.round((trackMax - min) * index / (tickCount - 1) / step) * step + min)), ...(recommended === undefined ? [] : [recommended])])].sort((a,b) => a-b)
  const display = formatValue ? formatValue(value) : `${value}${unit ? ` ${unit}` : ''}`
  const commit = (number) => onChange(clamp(number))
  return <div className="design-slider-control">
    <div className="design-slider-heading">
      <label htmlFor={id}>{label}</label>
      <output htmlFor={id} className="design-slider-value" aria-hidden="true">{display}</output>
    </div>
    <div className="design-slider-track-row">
      <div className="design-partitioned-track">
        <div className="design-slider-ticks" aria-hidden="true">{ticks.map((tick,index) => <i key={index} style={{ left:`${(tick - min) / (trackMax - min) * 100}%` }} />)}</div>
        <input id={id} type="range" aria-label={ariaLabel} aria-valuetext={display} min={min} max={trackMax} step={step} value={value}
          onPointerDown={() => { pointer.current = true }} onPointerUp={() => { pointer.current = false }} onPointerCancel={() => { pointer.current = false }} onBlur={() => { pointer.current = false }}
          onChange={(event) => { const number = Number(event.target.value); commit(pointer.current ? ticks.reduce((closest,tick) => Math.abs(tick-number) < Math.abs(closest-number) ? tick : closest) : number) }} />
      </div>
      <button type="button" aria-label={`Decrease ${ariaLabel}`} title={`Decrease ${label}`} disabled={value <= min} onClick={() => commit(value - step)}><Icon name="minus" className="h-4 w-4" /></button>
      <button type="button" aria-label={`Increase ${ariaLabel}`} title={`Increase ${label}`} disabled={value >= max} onClick={() => commit(value + step)}><Icon name="plus" className="h-4 w-4" /></button>
    </div>
    {children}
  </div>
}
