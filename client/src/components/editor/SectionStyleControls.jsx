import { ColorControl, NumberControl, SpacingControl } from './AppearanceControls'

export default function SectionStyleControls({ value = {}, defaults, onChange, headingMax = 44, headingMin = 10 }) {
  const custom = Object.keys(value).some((key) => !['title', 'hidden'].includes(key))
  const reset = () => onChange(Object.fromEntries(Object.entries(value).filter(([key]) => ['title', 'hidden'].includes(key))))
  const set = (key, next) => onChange({ ...value, [key]: next })
  const resume = headingMax === 22
  return <fieldset className="section-style-controls appearance-section">
    <legend>Section appearance</legend>
    <label className="appearance-inherit"><input type="checkbox" aria-label="Use general style" checked={!custom} onChange={(event) => event.target.checked ? reset() : set('fontSize', defaults.fontSize)} /><span>Use general style<small>{custom ? 'Your adjustments apply to this section.' : 'Matches the rest of your design.'}</small></span></label>
    <div className="appearance-card"><div className="appearance-card-heading"><span aria-hidden="true">Aa</span><div><h3>Typography</h3><p>Set clear, readable text sizes.</p></div></div><div className="appearance-type-group">
      <NumberControl label="Body text" ariaLabel="Section body text size" value={value.fontSize ?? defaults.fontSize} min={11} max={22} onChange={(next) => set('fontSize', next)} hint={value.fontSize === undefined ? 'From General' : undefined} />
      <NumberControl label="Heading" ariaLabel="Section heading size" value={value.headingSize ?? defaults.headingSize} min={headingMin} max={headingMax} onChange={(next) => set('headingSize', next)} hint={value.headingSize === undefined ? 'From General' : undefined} />
    </div></div>
    <div className="appearance-card"><div className="appearance-card-heading"><span aria-hidden="true">↕</span><div><h3>Spacing</h3><p>Choose how much room your content needs.</p></div></div>
    <SpacingControl label="Line spacing" ariaLabel="Section line spacing" value={value.lineHeight ?? defaults.lineHeight} min={1.2} max={2.2} step={.1} unit="" options={[["Tight", 1.3], ["Regular", 1.6], ["Relaxed", 2]]} onChange={(next) => set('lineHeight', next)} />
    <SpacingControl label="Section spacing" ariaLabel="Section spacing" value={value.spacing ?? defaults.spacing} options={resume ? [['Compact',12],['Balanced',24],['Roomy',36]] : [['Compact',24],['Balanced',48],['Roomy',80]]} onChange={(next) => set('spacing', next)} />
    </div>
    <div className="appearance-card"><div className="appearance-card-heading"><span aria-hidden="true">◐</span><div><h3>Color</h3><p>Choose a named color or enter your own.</p></div></div>
    <ColorControl label="Section accent color" value={value.accent || defaults.accent} hint={!value.accent ? 'From General' : undefined} onChange={(next) => set('accent', next)} />
    </div>
    <button type="button" aria-label="Reset to general style" disabled={!custom} onClick={reset} className="appearance-reset">Reset to general style</button>
  </fieldset>
}
