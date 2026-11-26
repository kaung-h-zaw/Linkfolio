import { collectionLayout } from '../../lib/resumeSectionLayouts'

export default function ResumeCollectionControls({section,value,change}) {
  const mode = collectionLayout(section.key, value)
  const options=(legend,key,items,fallback)=><fieldset className="layout-visual-controls"><legend>{legend}</legend><div className="entry-setting-choices">{items.map(([id,label])=><button type="button" key={id} aria-label={`${section.title} ${legend}: ${label}`} aria-pressed={(value[key]||fallback)===id} onClick={()=>change({...value,[key]:id})}>{label}</button>)}</div></fieldset>
  return <>
    {mode==='columns' && <fieldset className="layout-visual-controls"><legend>Columns</legend><div className="entry-setting-choices section-column-choices">{[1,2,3,4].map(number=><button type="button" key={number} aria-label={`${section.title} columns: ${number}`} aria-pressed={(value.columns||2)===number} onClick={()=>change({...value,columns:number,contentLayout:'columns'})}><span aria-hidden="true" className="section-columns-sketch">{Array.from({length:number},(_,index)=><i key={index}/>)}</span><span>{number}</span></button>)}</div></fieldset>}
    {mode==='list' && <>{options('Row spacing','rowSpacing',[['tight','Tight'],['spacious','Spacious']],'tight')}<label className="resume-simple-toggle"><input type="checkbox" checked={Boolean(value.rowBullets)} onChange={event=>change({...value,rowBullets:event.target.checked})}/><span>Start rows with bullets</span></label></>}
    {mode==='compact' && options('Separator','compactSeparator',[['bullet','Bullet'],['pipe','Pipe'],['comma','Comma']],'bullet')}
    {['list','compact','tags'].includes(mode) && options('Subinfo style','subinfoStyle',[['colon',': Colon'],['dash','– Dash'],['brackets','() Bracket']],'dash')}

  </>
}
