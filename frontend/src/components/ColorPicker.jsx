import { useEffect, useId, useRef, useState } from 'react'
import Icon from './Icon'
import { hexToHsv, hsvToHex } from '../lib/colorPicker'
import './colorPicker.css'
import useThrottledChange from '../lib/useThrottledChange'

export default function ColorPicker({ value = '#137763', onChange, label = 'Custom color' }) {
  const dialog = useRef(null)
  const trigger = useRef(null)
  const id = useId()
  const [open,setOpen] = useState(false)
  const [hsv,setHsv] = useState(() => hexToHsv(value))
  const [hex,setHex] = useState(value)
  const [invalid,setInvalid] = useState(false)
  const {schedule,flush} = useThrottledChange(onChange)
  useEffect(() => {
    if (!open) return
    const element = dialog.current
    const button = trigger.current
    element.showModal()
    return () => { element.close(); button?.focus({preventScroll:true}) }
  },[open])
  function update(next) {
    const color = hsvToHex(next)
    setHsv(next); setHex(color); setInvalid(false)
    schedule(color)
  }
  function point(event) {
    const box = event.currentTarget.getBoundingClientRect()
    update({...hsv,s:Math.max(0,Math.min(1,(event.clientX-box.left)/box.width)),v:1-Math.max(0,Math.min(1,(event.clientY-box.top)/box.height))})
  }
  return <>
    <button ref={trigger} type="button" className="lf-color-trigger" aria-label={label} aria-haspopup="dialog" aria-expanded={open} onClick={() => {setHsv(hexToHsv(value));setHex(value);setInvalid(false);setOpen(true)}}><span style={{backgroundColor:value}}/><span>{label}</span><Icon name="down" className="h-4 w-4"/></button>
    <dialog ref={dialog} className="linkfolio-app lf-color-dialog" aria-labelledby={`${id}-title`} onClose={() => {flush();setOpen(false)}} onClick={event => {if(event.target === event.currentTarget) {flush();setOpen(false)}}}>
      <header><h2 id={`${id}-title`}>{label}</h2></header>
      <div className="lf-color-plane" style={{backgroundColor:`hsl(${hsv.h},100%,50%)`}} role="slider" tabIndex={0} aria-label="Color saturation and brightness" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(hsv.s*100)} aria-valuetext={`Saturation ${Math.round(hsv.s*100)}%, brightness ${Math.round(hsv.v*100)}%`} onPointerDown={event => {event.currentTarget.setPointerCapture(event.pointerId);point(event)}} onPointerMove={event => {if(event.currentTarget.hasPointerCapture(event.pointerId)) point(event)}} onPointerUp={event => {flush();if(event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)}} onPointerCancel={flush} onBlur={flush} onKeyUp={flush} onKeyDown={event => {
        if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) return
        event.preventDefault()
        const step = event.shiftKey ? .1 : .01
        update({...hsv,s:Math.max(0,Math.min(1,hsv.s+(event.key==='ArrowRight'?step:event.key==='ArrowLeft'?-step:0))),v:Math.max(0,Math.min(1,hsv.v+(event.key==='ArrowUp'?step:event.key==='ArrowDown'?-step:0)))})
      }}><span style={{left:`${hsv.s*100}%`,top:`${(1-hsv.v)*100}%`}}/></div>
      <label className="lf-color-hue-label" htmlFor={`${id}-hue`}>Hue</label><input id={`${id}-hue`} className="lf-color-hue" type="range" min="0" max="359" value={Math.round(hsv.h)} onChange={event => update({...hsv,h:Number(event.target.value)})} onPointerUp={flush} onBlur={flush} onKeyUp={flush}/>
      <label className="lf-color-hex-label" htmlFor={`${id}-hex`}>Hex color</label><div className="lf-color-hex"><span style={{backgroundColor:hsvToHex(hsv)}}/><input id={`${id}-hex`} value={hex} spellCheck={false} maxLength={7} aria-invalid={invalid || undefined} aria-describedby={invalid ? `${id}-error` : undefined} onChange={event => {
        const text = event.target.value
        setHex(text);setInvalid(false)
        if (/^#[0-9a-f]{6}$/i.test(text)) {flush();setHsv(hexToHsv(text));onChange(text)}
      }} onBlur={() => setInvalid(!/^#[0-9a-f]{6}$/i.test(hex))}/></div>
      {invalid && <p id={`${id}-error`} role="alert" className="lf-color-error">Enter a six-digit hex color, such as #137763.</p>}
      <footer><span>Live color preview</span><button type="button" onClick={() => {if(/^#[0-9a-f]{6}$/i.test(hex)) {flush();setOpen(false)}else setInvalid(true)}}>Done</button></footer>
    </dialog>
  </>
}
