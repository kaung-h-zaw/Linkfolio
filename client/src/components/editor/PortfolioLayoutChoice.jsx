import Icon from '../Icon'

const icons = { 'portrait-left':'user', 'form-first':'edit', template:'window', left:'alignLeft', centered:'alignCenter', split:'window', reading:'file', cards:'grid', list:'list', feature:'star', timeline:'list', compact:'menu', grid:'grid', simple:'mail' }
const descriptions = { template:'Keep the template layout', left:'Text aligned to the left', centered:'A centered focal point', split:'Two balanced areas', reading:'A focused text column', cards:'Separate bordered cards', list:'Entries stacked vertically', feature:'Lead with a larger project', timeline:'Entries along a vertical line', compact:'A tighter, condensed list', grid:'Entries side by side', simple:'A direct contact block' }

function LayoutSketch({ layout, sectionKey }) {
  const lines = (x, y, width = 50) => <g fill="currentColor"><rect x={x} y={y} width={width * .65} height="4" rx="2" opacity=".8" /><rect x={x} y={y+9} width={width} height="3" rx="1.5" opacity=".25" /><rect x={x} y={y+16} width={width*.8} height="3" rx="1.5" opacity=".25" /></g>
  let content
  if (sectionKey === 'contact') {
    const form = (x,y,width,height) => <g><rect x={x} y={y} width={width} height={height} rx="5" fill="currentColor" fillOpacity=".03" stroke="currentColor" strokeOpacity=".25" /><rect x={x+7} y={y+8} width={(width-18)/2} height="9" rx="2" fill="currentColor" opacity=".15" /><rect x={x+width/2+2} y={y+8} width={(width-18)/2} height="9" rx="2" fill="currentColor" opacity=".15" /><rect x={x+7} y={y+23} width={width-14} height={height-42} rx="2" fill="currentColor" opacity=".1" /><rect x={x+7} y={y+height-13} width={width-14} height="6" rx="2" fill="currentColor" opacity=".6" /></g>
    if (layout === 'form-first') content = <><rect x="6" y="5" width="148" height="80" rx="6" fill="currentColor" fillOpacity=".03" stroke="currentColor" strokeOpacity=".2" />{form(13,12,86,66)}<path d="M109 16V74" stroke="currentColor" opacity=".2" />{lines(117,24,30)}<rect x="117" y="58" width="7" height="7" rx="2" fill="currentColor" opacity=".3" /><rect x="129" y="58" width="7" height="7" rx="2" fill="currentColor" opacity=".3" /></>
    else if (layout === 'simple') content = <><rect x="14" y="8" width="65" height="3" rx="1.5" fill="currentColor" opacity=".6" /><path d="M14 34H76M86 34H146M14 62H146" stroke="currentColor" opacity=".25" /><rect x="14" y="21" width="32" height="3" rx="1.5" fill="currentColor" opacity=".25" /><rect x="86" y="21" width="32" height="3" rx="1.5" fill="currentColor" opacity=".25" /><rect x="14" y="46" width="78" height="3" rx="1.5" fill="currentColor" opacity=".15" /><rect x="14" y="73" width="50" height="8" rx="2" fill="currentColor" opacity=".6" /></>
    else content = <>{lines(10,24,54)}<rect x="10" y="57" width="40" height="3" rx="1.5" fill="currentColor" opacity=".4" />{form(80,9,70,72)}</>
  } else if (sectionKey === 'hero') {
    const portrait = (x,y,width,height) => <g><rect x={x} y={y} width={width} height={height} rx="5" fill="currentColor" opacity=".12" /><circle cx={x+width/2} cy={y+height*.33} r={width*.18} fill="currentColor" opacity=".3" /><path d={`M${x+width*.15} ${y+height*.84}Q${x+width/2} ${y+height*.35} ${x+width*.85} ${y+height*.84}`} fill="currentColor" opacity=".3" /></g>
    if (layout === 'portrait-left') content = <>{portrait(10,8,57,74)}{lines(81,24,65)}<rect x="81" y="62" width="43" height="7" rx="2" fill="currentColor" opacity=".5" /></>
    else if (layout === 'centered') content = <>{portrait(68,5,24,26)}<rect x="54" y="40" width="52" height="5" rx="2" fill="currentColor" opacity=".8" /><rect x="44" y="51" width="72" height="3" rx="1.5" fill="currentColor" opacity=".25" /><rect x="54" y="60" width="52" height="3" rx="1.5" fill="currentColor" opacity=".25" /><rect x="61" y="74" width="38" height="7" rx="2" fill="currentColor" opacity=".5" /></>
    else if (layout === 'split') content = <>{lines(12,24,67)}<rect x="12" y="61" width="40" height="7" rx="2" fill="currentColor" opacity=".5" />{portrait(96,10,52,70)}</>
    else content = <>{lines(12,22,78)}<rect x="12" y="61" width="40" height="7" rx="2" fill="currentColor" opacity=".5" />{portrait(111,23,36,44)}</>
  } else if (['cards','grid','feature'].includes(layout)) {
    const cells = layout === 'feature' ? [[12,10,136,32],[12,48,64,32],[84,48,64,32]] : [[12,10,64,32],[84,10,64,32],[12,48,64,32],[84,48,64,32]]
    content = cells.map(([x,y,w,h],index) => <g key={index}>{layout !== 'grid' && <rect x={x} y={y} width={w} height={h} rx="4" fill="currentColor" fillOpacity=".04" stroke="currentColor" strokeOpacity=".3" />}{lines(x+8,y+7,w-16)}</g>)
  } else if (layout === 'timeline') {
    content = <><path d="M25 12V78" stroke="currentColor" opacity=".35" />{[15,44,73].map(y=><g key={y}><circle cx="25" cy={y} r="3.5" fill="currentColor" />{lines(40,y-3,100)}</g>)}</>
  } else if (layout === 'compact') {
    content = [15,33,51,69].map(y=><g key={y}><rect x="14" y={y} width="40" height="4" rx="2" fill="currentColor" opacity=".7" /><rect x="65" y={y} width="80" height="3" rx="1.5" fill="currentColor" opacity=".25" /></g>)
  } else if (layout === 'split') {
    content = <>{lines(13,28,56)}<rect x="89" y="13" width="58" height="64" rx="5" fill="currentColor" opacity=".12" /><circle cx="118" cy="35" r="10" fill="currentColor" opacity=".3" /><path d="M98 66Q118 38 138 66" fill="currentColor" opacity=".3" /></>
  } else if (layout === 'centered') {
    content = <><circle cx="80" cy="24" r="13" fill="currentColor" opacity=".2" />{lines(46,46,68)}<rect x="65" y="73" width="30" height="7" rx="3" fill="currentColor" opacity=".5" /></>
  } else if (layout === 'reading') {
    content = <>{lines(40,15,80)}{lines(40,45,80)}<rect x="40" y="73" width="65" height="3" rx="1.5" fill="currentColor" opacity=".25" /></>
  } else if (layout === 'template') {
    content = <><rect x="12" y="10" width="136" height="12" rx="3" fill="currentColor" opacity=".15" /><rect x="12" y="30" width="38" height="50" rx="3" fill="currentColor" opacity=".12" />{lines(61,33,75)}{lines(61,61,75)}</>
  } else {
    content = <>{lines(16,14,126)}{lines(16,48,126)}<path d="M16 40H144M16 75H144" stroke="currentColor" opacity=".15" /></>
  }
  return <svg viewBox="0 0 160 90" aria-hidden="true" className="portfolio-layout-sketch">{content}</svg>
}

export default function PortfolioLayoutChoice({ sectionKey, sectionTitle, layout, previewLayout, label, selected, onSelect }) {
  return <button type="button" aria-label={`${sectionTitle}: ${layout === 'template' ? 'Template default' : label}`} aria-pressed={selected} onClick={onSelect}>
    <LayoutSketch layout={previewLayout || layout} sectionKey={sectionKey} />
    <span className="portfolio-layout-choice-title"><Icon name={icons[layout]} className="h-4 w-4" /><span>{label}</span><span className="portfolio-layout-choice-check" aria-hidden="true">{selected && <Icon name="check" className="h-3 w-3" />}</span></span>
    <span className="portfolio-layout-choice-description">{sectionKey === 'hero' && layout === 'portrait-left' ? 'Large portrait with text beside it' : sectionKey === 'hero' && layout === 'centered' ? 'Portrait above centered text' : sectionKey === 'hero' && layout === 'split' ? 'Balanced text and portrait' : sectionKey === 'contact' && layout === 'simple' ? 'Minimal form, no card' : sectionKey === 'contact' && layout === 'form-first' ? 'Wide form with contact sidebar' : descriptions[layout]}</span>
  </button>
}
