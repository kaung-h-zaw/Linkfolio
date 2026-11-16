import { Children, cloneElement, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { packResumeColumns } from '../lib/resumeColumnFlow'
import { paginateColumns } from '../lib/resumeColumnPagination'

// Keep entries (and two-column skill/language rows) together at page boundaries.
function splitSection(node) {
  if (!node.props.sectionKey) return [{ node }]
  let entries = Children.toArray(node.props.children)
  let wrapper
  if (entries.length === 1 && /\b(grid|space-y-3)\b/.test(entries[0].props.className || '')) {
    wrapper = entries[0]
    entries = Children.toArray(wrapper.props.children)
  }
  const step = wrapper?.props.className.includes('grid') ? Number(wrapper.props['data-layout-columns']) || 2 : 1
  const units = []
  for (let i = 0; i < entries.length; i += step) {
    const content = entries.slice(i, i + step)
    units.push({
      node: cloneElement(node, {}, wrapper ? cloneElement(wrapper, {}, content) : content),
      section: node.props.sectionKey,
      wrapper,
      content,
    })
  }
  return units
}

function mergeUnits(units) {
  const groups = []
  for (const unit of units) {
    const previous = groups.at(-1)
    if (unit.section && previous?.section === unit.section && !previous.zoom && !unit.zoom) {
      previous.content.push(...unit.content)
    } else {
      groups.push({ ...unit, content: unit.content?.slice() })
    }
  }
  return groups.map((unit, index) => cloneElement(unit.node, {
    key: index,
    ...(unit.zoom ? { style: { ...unit.node.props.style, zoom: unit.zoom } } : {}),
  }, unit.section
    ? unit.wrapper ? cloneElement(unit.wrapper, {}, unit.content) : unit.content
    : unit.node.props.children))
}

export default function PaginatedDocument({ pages, documentProps, footer }) {
  const sourceRef = useRef(null)
  const measureRef = useRef(null)
  const [layout, setLayout] = useState([])
  const batches = useMemo(() => pages.map((page) => page.flatMap(splitSection)), [pages])

  useLayoutEffect(() => {
    const source = sourceRef.current
    const measure = measureRef.current
    let cancelled = false
    let frame = 0
    let observedWidth = source.clientWidth
    const paginate = () => {
      if (cancelled || !source.clientWidth) return
      const result = []
      const style = getComputedStyle(measure)
      const ratio = documentProps.style['--design-ratio'] || '210 / 297'
      const [width, height] = ratio.split('/').map(Number)
      const pageHeight = source.clientWidth * height / width
      measure.style.height = `${pageHeight}px`
      const bottomInset = parseFloat(style.paddingBottom) + parseFloat(style.borderBottomWidth)
      const screenScale = source.getBoundingClientRect().width / source.offsetWidth || 1
      const fits = () => {
        const bottom = measure.getBoundingClientRect().top + (pageHeight - bottomInset) * screenScale
        return [...measure.querySelectorAll('*')].every((element) =>
          element.getBoundingClientRect().bottom <= bottom + 0.5 * screenScale)
      }
      let sourceIndex = 0
      const independentColumns = style.display === 'grid' && style.gridTemplateColumns.trim().split(/\s+/).length === 2
      if (independentColumns) {
        result.push(...paginateColumns({batches,source,measure,pageHeight,bottomInset,screenScale}))
      } else for (const batch of batches) {
        let current = []
        measure.replaceChildren()
        let lastSection
        let lastElement
        const append = (unit, element) => {
          if (unit.section && lastSection === unit.section) {
            const destination = unit.wrapper ? lastElement.children[1] : lastElement
            const entries = unit.wrapper ? element.children[1].children : [...element.children].slice(1)
            destination.append(...[...entries])
          } else {
            measure.append(element)
            lastElement = element
            lastSection = unit.section
          }
        }
        for (const [unitIndex,unit] of batch.entries()) {
          const original = source.children[sourceIndex++]
          // Prefer one complete Skills section to a repeated heading across pages.
          // Sections taller than a fresh sheet still flow row by row below.
          if (unit.section === 'skills' && batch[unitIndex-1]?.section !== 'skills' && current.length) {
            const whole=original.cloneNode(true)
            const destination=unit.wrapper ? whole.children[1] : whole
            for(let offset=1;batch[unitIndex+offset]?.section==='skills';offset++) {
              const next=source.children[sourceIndex+offset-1].cloneNode(true)
              const entries=unit.wrapper ? next.children[1].children : [...next.children].slice(1)
              destination.append(...[...entries])
            }
            const previous=[...measure.children]
            measure.replaceChildren(whole)
            const fitsFreshPage=fits()
            measure.replaceChildren(...previous)
            if (fitsFreshPage) {
              measure.append(whole)
              const fitsRemainingSpace=fits()
              whole.remove()
              if (!fitsRemainingSpace) {
                result.push(current)
                current=[]
                measure.replaceChildren()
                lastSection=undefined
                lastElement=undefined
              }
            }
          }
          append(unit, original.cloneNode(true))
          let fitting = fits()
          if (!fitting && current.length) {
            result.push(current)
            current = []
            measure.replaceChildren()
            lastSection = undefined
            append(unit, original.cloneNode(true))
            fitting = fits()
          }
          let next = unit
          // An exceptionally tall single entry must still stay on the paper.
          if (!fitting) {
            const element = measure.lastElementChild
            const available = pageHeight - parseFloat(style.paddingTop) - bottomInset
            const extent = (Math.max(...[element, ...element.querySelectorAll('*')].map((child) => child.getBoundingClientRect().bottom))
              - measure.getBoundingClientRect().top) / screenScale - parseFloat(style.paddingTop)
            const zoom = Math.min(1, available / (extent + 1))
            element.style.zoom = zoom
            next = { ...unit, zoom }
          }
          current.push(next)
          // Keep a scaled entry separate from the next entry in its section.
          if (next.zoom) lastSection = undefined
        }
        result.push(current)
      }
      measure.replaceChildren()
      setLayout(result)
    }
    const schedule = () => {
      if (cancelled || frame) return
      frame = requestAnimationFrame(() => { frame = 0; paginate() })
    }
    schedule()
    const observer = new ResizeObserver(() => {
      const width = source.clientWidth
      if (width !== observedWidth) { observedWidth = width; schedule() }
    })
    observer.observe(source)
    if (document.fonts.status === 'loading') document.fonts.ready.then(schedule)
    document.fonts.addEventListener('loadingdone', schedule)
    source.addEventListener('load',schedule,true)
    return () => {
      cancelled = true
      if (frame) cancelAnimationFrame(frame)
      observer.disconnect()
      document.fonts.removeEventListener('loadingdone', schedule)
      source.removeEventListener('load',schedule,true)
    }
  }, [batches, documentProps])

  return (
    <div className="resume-pages" aria-label="Resume pages">
      <div className="resume-measurement" aria-hidden="true" inert>
        <article {...documentProps} ref={sourceRef}>
          {batches.flat().map((unit, index) => cloneElement(unit.node, { key: index }))}
        </article>
        <article {...documentProps} ref={measureRef} />
      </div>
      {layout.map((units, index) => (
        <article {...documentProps} key={index} ref={element => packResumeColumns(element)} className={`${documentProps.className} resume-page`}
          aria-label={`Resume document page ${index + 1}`} data-page={index + 1}>
          {mergeUnits(units)}
          {(footer?.pages || footer?.email || footer?.name) && <footer className="resume-page-footer" aria-label="Page footer">{footer.name && <span className="resume-footer-name" title={footer.name}>{footer.name}</span>}{footer.email && <span className="resume-footer-email" title={footer.email}>{footer.email}</span>}{footer.pages && <span className="resume-page-number">{index+1} / {layout.length}</span>}</footer>}
        </article>
      ))}
    </div>
  )
}
