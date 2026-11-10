import { useEffect, useRef, useState } from 'react'
import PortfolioPreview from './PortfolioPreview'

// Keep the editing canvas in laptop layout, without a device frame or inner scrollbar.
export default function PortfolioEditorPreview({ profile, settings }) {
  const host = useRef(null)
  const [width, setWidth] = useState(1024)
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(host.current)
    return () => observer.disconnect()
  }, [])
  return (
    <div ref={host} className="portfolio-preview-fit w-full min-w-0">
      <div className="portfolio-editor-canvas" style={{ width: 1024, zoom: Math.min(1, width / 1024) }}>
        <PortfolioPreview profile={profile} settings={settings} />
      </div>
    </div>
  )
}
