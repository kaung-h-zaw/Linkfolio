import Icon from '../Icon'
import SliderControl from './SliderControl'
import { DesignHistory } from './DesignStartingPoints'
import { portfolioSpacing, matchesPreset } from '../../lib/designPresets'
import { portfolioDesignDefaults, portfolioFonts } from '../../lib/portfolioDesign'
import PortfolioSectionDesigns from './PortfolioSectionDesigns'
import ResumeCustomizationGroups from './ResumeCustomizationGroups'

export default function PortfolioDesignControls({settings,profile,onChange,styleHistory,templatePicker,customizationTab,onCustomizationTabChange,selectedSection,onSelectSection}) {
  const overrides=settings.design||{},design={...portfolioDesignDefaults,...overrides}
  const set=(key,value)=>onChange({...settings,design:{...overrides,...(key==='imageEffect'&&overrides.coverEffect===undefined?{coverEffect:overrides.imageEffect||'template'}:{}),...(key==='imagePosition'&&overrides.heroPosition===undefined?{heroPosition:overrides.imagePosition||'center'}:{}),[key]:value}})
  if(overrides.projectImageRadius===undefined)design.projectImageRadius=design.imageRadius
  const reset=keys=>onChange({...settings,design:Object.fromEntries(Object.entries(overrides).filter(([key])=>!keys.includes(key)))})
  const select=(key,label,options)=><label className="block text-sm font-semibold">{label}<select aria-label={label} value={design[key]} onChange={event=>set(key,event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-line bg-white px-3 text-sm font-normal">{Object.entries(options).map(([value,name])=><option key={value} value={value}>{name}</option>)}</select></label>
  const range=(key,label,min,max,step=1)=><SliderControl label={label} value={design[key]} min={min} max={max} step={step} unit={key==='lineHeight'?'×':'px'} recommended={portfolioDesignDefaults[key]} onChange={value=>set(key,value)}/>
  const color=(label,value,change)=><label className="portfolio-simple-color"><span>{label}</span><input type="color" aria-label={label} value={value||'#137763'} onChange={event=>change(event.target.value)}/></label>
  const card=(key,title,children,keys)=><section className="resume-design-card" data-design-group={key} aria-label={title}><div className="resume-design-card-heading"><h2>{title}</h2>{keys&&<button type="button" className="design-card-reset" title={`Reset ${title.toLowerCase()}`} aria-label={`Reset ${title.toLowerCase()}`} onClick={()=>reset(keys)}><Icon name="undo" className="h-4 w-4"/></button>}</div><div className="portfolio-design-card-body">{children}</div></section>
  return <div className="resume-design-groups portfolio-design-groups">
    {styleHistory&&<DesignHistory {...styleHistory}/>}
    <ResumeCustomizationGroups value={customizationTab} onChange={onCustomizationTabChange} sections={<PortfolioSectionDesigns settings={settings} profile={profile} onChange={onChange} selected={selectedSection} onSelect={onSelectSection} select={select} range={range} design={design}/> }>
      {templatePicker}
      {card('colors','Colors',<>
        {select('palette','Website colors',{template:'Original template colors',light:'Light',dark:'Dark',custom:'Custom colors'})}
        <fieldset><legend className="mb-3 text-sm font-semibold">Accent color</legend><div className="portfolio-accent-swatches">{['#137763','#245778','#394653','#91472f','#843b4d','#59632d'].map(hex=><button key={hex} type="button" aria-label={`Accent color: ${hex}`} aria-pressed={Boolean(overrides.accentCustom)&&settings.color===hex} style={{background:hex}} onClick={()=>onChange({...settings,color:hex,design:{...overrides,accentCustom:true}})}>{overrides.accentCustom&&settings.color===hex&&<Icon name="check" className="h-4 w-4"/>}</button>)}<label className="portfolio-custom-accent"><Icon name="edit" className="h-4 w-4"/><span>Custom color</span><input type="color" aria-label="Custom accent color" value={settings.color||'#137763'} onChange={event=>onChange({...settings,color:event.target.value,design:{...overrides,accentCustom:true}})}/></label></div></fieldset>
        <button type="button" aria-pressed={!overrides.accentCustom} className="portfolio-original-button" onClick={()=>set('accentCustom',false)}>Use template accent</button>
        {design.palette==='custom'&&<>{color('Page background',design.background,value=>set('background',value))}{color('Card background',settings.surface,value=>onChange({...settings,surface:value}))}{color('Text color',design.text,value=>set('text',value))}</>}
      </>)}
      {card('type','Text size & font',<>{select('font','Portfolio font',portfolioFonts)}<div className="design-slider-list">{range('bodySize','Body text size',12,22)}{range('titleSize','Introduction title size',28,88)}{range('headingSize','Section heading size',20,44)}{range('lineHeight','Text line spacing',1.2,2.2,.1)}</div></>,['font','bodySize','titleSize','headingSize','lineHeight'])}
      {card('spacing','Spacing',<><div className="spacing-card-presets" role="group" aria-label="Spacing presets">{portfolioSpacing.map(preset=><button type="button" key={preset.id} aria-label={`${preset.name} spacing`} aria-pressed={matchesPreset(design,preset.values)} onClick={()=>onChange({...settings,design:{...overrides,...preset.values}})}>{preset.name}</button>)}</div><div className="design-slider-list">{range('sectionSpace','Section spacing',16,100)}{range('gutter','Horizontal padding',12,64)}{range('cardRadius','Card corners',0,32)}</div></>,['sectionSpace','gutter','cardRadius'])}
    </ResumeCustomizationGroups>
    <button type="button" className="portfolio-original-button" onClick={()=>onChange({...settings,design:{...(overrides.sectionOrder?{sectionOrder:overrides.sectionOrder}:{})},sectionTitles:{},sectionLayouts:{},color:'#137763',surface:'#f1f6f2'})}>Reset design to template defaults</button>
  </div>
}
