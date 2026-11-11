import { useEffect, useRef, useState } from 'react'
import PortfolioPreview from './PortfolioPreview'

const DESKTOP_PREVIEW_WIDTH = 1440

// Render at the same logical width as Desktop preview, then scale it into the editor pane.
export default function PortfolioEditorPreview({ profile, settings }) {
  const host = useRef(null)
  const [width, setWidth] = useState(1024)
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(host.current)
    return () => observer.disconnect()
  }, [])
  const zoom = Math.min(1, width / DESKTOP_PREVIEW_WIDTH)
  return (
    <div ref={host} className="portfolio-preview-fit flex w-full min-w-0 justify-center">
      <div className="portfolio-editor-canvas" style={{ width: DESKTOP_PREVIEW_WIDTH, zoom }}>
        <PortfolioPreview profile={profile} settings={settings} />
      </div>
    </div>
  )
}
