import { Children, Fragment, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Icon from './Icon'
import './select.css'

function collectOptions(children, groupDisabled = false) {
  return Children.toArray(children).flatMap(child => {
    if (!child || typeof child !== 'object') return []
    if (child.type === Fragment || child.type === 'optgroup') return collectOptions(child.props.children,groupDisabled || child.props.disabled)
    if (child.type !== 'option') return []
    const text = Children.toArray(child.props.children).join('')
    return [{value:String(child.props.value ?? text),label:text,disabled:groupDisabled || child.props.disabled}]
  })
}

export default function Select({ children, value, defaultValue, onChange, disabled, id, name, className = '', menuClassName = '', style, onBlur, onFocus, ...props }) {
  const generatedId = useId()
  const trigger = useRef(null)
  const menu = useRef(null)
  const search = useRef({text:'',time:0})
  const [internalValue,setInternalValue] = useState(defaultValue)
  const [open,setOpen] = useState(false)
  const [active,setActive] = useState(-1)
  const [position,setPosition] = useState(null)
  const [host,setHost] = useState(null)
  const options = collectOptions(children)
  const current = String(value ?? internalValue ?? options.find(option => !option.disabled)?.value ?? '')
  const selected = options.find(option => option.value === current)
  const menuId = `${generatedId}-options`
  const label = props['aria-label'] || props.title || name
  const enabled = options.map((option,index) => !option.disabled ? index : -1).filter(index => index >= 0)

  useLayoutEffect(() => {
    if (!open) return
    function place() {
      const rect = trigger.current.getBoundingClientRect()
      const gap = 6
      const below = window.innerHeight - rect.bottom - 12
      const above = rect.top - 12
      const height = Math.min(300,Math.max(80,options.length * 40 + 12))
      const upward = below < Math.min(height,160) && above > below
      const maxHeight = Math.max(0,Math.min(300,upward ? above : below)-gap)
      const width = Math.min(Math.max(rect.width,240),window.innerWidth-16)
      setPosition({left:Math.max(8,Math.min(rect.left,window.innerWidth-width-8)),width,maxHeight, ...(upward ? {bottom:window.innerHeight-rect.top+gap} : {top:rect.bottom+gap})})
    }
    function outside(event) {
      if (!trigger.current?.contains(event.target) && !menu.current?.contains(event.target)) setOpen(false)
    }
    function scroll(event) { if (!menu.current?.contains(event.target)) setOpen(false) }
    place()
    document.addEventListener('pointerdown',outside,true)
    window.addEventListener('resize',place)
    window.addEventListener('scroll',scroll,true)
    return () => {
      document.removeEventListener('pointerdown',outside,true)
      window.removeEventListener('resize',place)
      window.removeEventListener('scroll',scroll,true)
    }
  },[open,options.length])

  useEffect(() => {
    if (open) menu.current?.querySelector(`[data-option-index="${active}"]`)?.scrollIntoView({block:'nearest'})
  },[open,active,position])

  function show() {
    if (disabled || !enabled.length) return
    setHost(trigger.current.closest('dialog') || document.body)
    setActive(options.findIndex(option => option.value === current && !option.disabled) >= 0 ? options.findIndex(option => option.value === current && !option.disabled) : enabled[0])
    setOpen(true)
  }
  function choose(index) {
    const option = options[index]
    if (!option || option.disabled) return
    setInternalValue(option.value)
    setOpen(false)
    trigger.current.focus({preventScroll:true})
    if (option.value !== current) {
      const target = {value:option.value,name,id}
      onChange?.({target,currentTarget:target})
    }
  }
  function keydown(event) {
    if (['ArrowDown','ArrowUp','Home','End'].includes(event.key)) {
      event.preventDefault()
      if (!open) { show(); return }
      if (event.key === 'Home') setActive(enabled[0])
      else if (event.key === 'End') setActive(enabled.at(-1))
      else {
        const index = enabled.indexOf(active)
        setActive(enabled[(index+(event.key === 'ArrowDown' ? 1 : -1)+enabled.length)%enabled.length])
      }
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (open) choose(active)
      else show()
    } else if (event.key === 'Escape') {
      if (open) { event.preventDefault(); event.stopPropagation(); setOpen(false) }
    } else if (event.key === 'Tab') setOpen(false)
    else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault()
      const text = (Date.now()-search.current.time < 700 ? search.current.text : '') + event.key.toLowerCase()
      search.current = {text,time:Date.now()}
      const match = enabled.find(index => options[index].label.toLowerCase().startsWith(text))
      if (!open) show()
      if (match !== undefined) setActive(match)
    }
  }
  return <>
    {name && <select hidden aria-hidden="true" tabIndex={-1} name={name} value={current} disabled={disabled} onChange={event => { setInternalValue(event.target.value); onChange?.(event) }}>{children}</select>}
    <button {...props} id={id} ref={trigger} type="button" role="combobox" aria-label={label} aria-expanded={open && !disabled} aria-controls={open ? menuId : undefined} aria-haspopup="listbox" aria-activedescendant={open && active >= 0 ? `${menuId}-${active}` : undefined} disabled={disabled} className={`lf-select-trigger ${className}`} style={style} onClick={() => open ? setOpen(false) : show()} onKeyDown={keydown} onFocus={onFocus} onBlur={event => { setOpen(false); onBlur?.(event) }}>
      <span>{selected?.label || 'Choose an option'}</span><Icon name="down" className="lf-select-chevron"/>
    </button>
    {open && !disabled && host && position && createPortal(<div ref={menu} id={menuId} role="listbox" aria-label={label || 'Choose an option'} className={`linkfolio-app lf-select-menu ${menuClassName}`} style={position} onPointerDown={event => event.preventDefault()}>
      {options.map((option,index) => <div key={`${option.value}-${index}`} id={`${menuId}-${index}`} role="option" aria-selected={option.value === current} aria-disabled={option.disabled || undefined} data-option-index={index} data-active={index === active || undefined} className="lf-select-option" onPointerMove={() => { if (!option.disabled) setActive(index) }} onClick={() => choose(index)}><span className="lf-select-check">{option.value === current && <Icon name="check"/>}</span><span>{option.label}</span></div>)}
    </div>,host)}
  </>
}
