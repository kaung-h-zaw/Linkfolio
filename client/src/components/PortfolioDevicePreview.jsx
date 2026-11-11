import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiMonitor, FiTablet, FiSmartphone, FiX } from 'react-icons/fi'
import PortfolioPreview from './PortfolioPreview'

const devices = [
  { id: 'desktop', label: 'Desktop', width: 1440, height: 900, Icon: FiMonitor },
  { id: 'tablet', label: 'Tablet', width: 768, height: 1024, Icon: FiTablet },
  { id: 'mobile', label: 'Mobile', width: 390, height: 844, Icon: FiSmartphone },
]
const frameDocument = '<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Portfolio device preview</title><style>html,body{margin:0;scrollbar-width:none}html::-webkit-scrollbar,body::-webkit-scrollbar{width:0;height:0;display:none}</style></head><body><div id="portfolio-root"></div></body></html>'

export default function PortfolioDevicePreview({ profile, settings, onExitPreview, focused = false }) {
  const [deviceId, setDeviceId] = useState('desktop')
  const [available, setAvailable] = useState({ width: 0, height: 0 })
  const [portalRoot, setPortalRoot] = useState(null)
  const stage = useRef(null)
  const device = focused ? devices.find((item) => item.id === deviceId) : devices[0]
  const scale = Math.max(0, Math.min(1, available.width / device.width))

  const viewportHeight = scale > 0 ? Math.max(1, Math.min(focused ? device.height : Infinity, Math.floor(available.height / scale))) : device.height

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setAvailable({ width: entry.contentRect.width, height: entry.contentRect.height }))
    observer.observe(stage.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!portalRoot) return
    const doc = portalRoot.ownerDocument
    function syncStyles() {
      doc.head.querySelectorAll('[data-preview-style]').forEach((style) => style.remove())
      document.querySelectorAll('style, link[rel="stylesheet"]').forEach((style) => {
        const copy = style.cloneNode(true)
        copy.setAttribute('data-preview-style', '')
        doc.head.appendChild(copy)
      })
    }
    syncStyles()
    // Keep an already-open preview current when development styles are updated.
    const observer = new MutationObserver(syncStyles)
    observer.observe(document.head, { subtree: true, childList: true, characterData: true, attributes: true })
    return () => observer.disconnect()
  }, [portalRoot])

  function prepareFrame(event) {
    setPortalRoot(event.currentTarget.contentDocument.getElementById('portfolio-root'))
  }

  function navigateSection(event) {
    const anchor = event.target.closest('a')
    const href = anchor?.getAttribute('href')
    if (!href?.startsWith('#')) return
    const target = anchor.ownerDocument.getElementById(href.slice(1))
    if (target) {
      event.preventDefault()
      target.scrollIntoView({ block: 'start' })
    }
  }

  return (
    <div className="mx-auto flex h-full min-h-0 w-full flex-col">
      {focused && <div className="mb-2 flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Preview device" className="flex flex-wrap gap-1 rounded-lg border border-line bg-white p-1">
          {devices.map(({ id, label, Icon }) => (
            <button key={id} type="button" aria-pressed={deviceId === id}
              onClick={() => setDeviceId(id)}
              className={`flex min-h-10 items-center gap-2 rounded-md px-3 text-xs font-medium ${deviceId === id ? 'bg-accent text-white' : 'text-muted hover:bg-paper'}`}>
              <Icon aria-hidden="true" className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
        <p role="status" className="text-xs tabular-nums text-muted">
          <span className="font-semibold text-ink">{device.width} × {viewportHeight} px</span>
          {available.width > 0 && <span className="ml-2">· {Math.round(scale * 100)}% zoom</span>}
        </p>
        {focused && <button type="button" onClick={onExitPreview} aria-label="Close preview" title="Close preview (Escape)"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-line bg-white text-muted hover:bg-paper">
          <FiX aria-hidden="true" className="h-5 w-5" />
        </button>}
        </div>
      </div>}
      <div ref={stage} className="min-h-0 w-full min-w-0 flex-1">
        <div className="relative mx-auto overflow-hidden rounded-lg bg-white shadow-md ring-1 ring-black/10"
          style={{ width: device.width * scale, height: viewportHeight * scale }}>
          <iframe title="Portfolio device preview" srcDoc={frameDocument} onLoad={prepareFrame}
            className="absolute left-0 top-0 origin-top-left border-0 bg-white"
            style={{ width: device.width, height: viewportHeight, transform: `scale(${scale})` }} />
          {portalRoot && createPortal(
            <div onClick={navigateSection} onKeyDown={(event) => {
              if (event.key === 'Escape') onExitPreview?.()
            }}>
              <PortfolioPreview key={device.id} profile={profile} settings={settings} />
            </div>, portalRoot)}
        </div>
      </div>

    </div>
  )
}
