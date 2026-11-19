import { useEffect, useLayoutEffect, useState } from 'react'
import { AppAppearanceContext, APP_APPEARANCE_KEY, validAppearance } from '../lib/appAppearanceContext'

export default function AppAppearanceProvider({ children }) {
  const [preference, setValue] = useState(()=>{
    try { return validAppearance(localStorage.getItem(APP_APPEARANCE_KEY)) } catch { return 'system' }
  })
  const [systemDark,setSystemDark] = useState(()=>window.matchMedia('(prefers-color-scheme: dark)').matches)
  const mode = preference==='system' ? systemDark?'dark':'light' : preference
  useEffect(()=>{
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const update = event=>setSystemDark(event.matches)
    const sync = event=>{if(event.key===APP_APPEARANCE_KEY || event.key===null)setValue(validAppearance(event.newValue))}
    media.addEventListener('change',update)
    window.addEventListener('storage',sync)
    return ()=>{media.removeEventListener('change',update);window.removeEventListener('storage',sync)}
  },[])
  useLayoutEffect(()=>{
    document.documentElement.dataset.appThemeChanging='true'
    document.documentElement.dataset.appTheme=mode
    const canvas = getComputedStyle(document.documentElement).getPropertyValue('--app-canvas').trim()
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content',canvas)
    document.querySelector('link[rel="icon"]')?.setAttribute('href','/favicon-light.svg')
    let settleFrame
    const paintFrame=requestAnimationFrame(()=>{settleFrame=requestAnimationFrame(()=>{delete document.documentElement.dataset.appThemeChanging})})
    return ()=>{cancelAnimationFrame(paintFrame);cancelAnimationFrame(settleFrame);delete document.documentElement.dataset.appThemeChanging}
  },[mode])
  function setPreference(value) {
    value=validAppearance(value)
    setValue(value)
    try { localStorage.setItem(APP_APPEARANCE_KEY,value) } catch { /* The choice still works when browser storage is unavailable. */ }
  }
  return <AppAppearanceContext.Provider value={{preference,mode,setPreference}}>{children}</AppAppearanceContext.Provider>
}
