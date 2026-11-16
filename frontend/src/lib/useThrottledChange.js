import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'

// Controls update locally on every pointer event; the document catches up at 12 fps.
export default function useThrottledChange(onChange, delay = 80) {
  const callback = useRef(onChange)
  const pending = useRef(null)
  const timer = useRef(null)
  useLayoutEffect(() => { callback.current = onChange },[onChange])
  const cancel = useCallback(() => {
    clearTimeout(timer.current)
    timer.current = null
    pending.current = null
  },[])
  const flush = useCallback(() => {
    clearTimeout(timer.current)
    timer.current = null
    const next = pending.current
    pending.current = null
    if (next) callback.current(next.value)
  },[])
  const schedule = useCallback(value => {
    pending.current = {value}
    if (timer.current === null) timer.current = setTimeout(flush,delay)
  },[delay,flush])
  useEffect(() => cancel,[cancel])
  return {schedule,flush,cancel}
}
