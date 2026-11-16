// This script runs after the palette stylesheet and before React's first paint.
(() => {
  let preference = 'system'
  try { preference = localStorage.getItem('linkfolio.appearance') } catch { /* Use the device preference when storage is unavailable. */ }
  const mode = preference === 'light' || preference === 'dark'
    ? preference : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  document.documentElement.dataset.appTheme = mode
  const canvas = getComputedStyle(document.documentElement).getPropertyValue('--app-canvas').trim()
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',canvas)
  document.querySelector('link[rel="icon"]')?.setAttribute('href','/favicon-light.svg')
})()
