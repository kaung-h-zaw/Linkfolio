import { matchesPreset } from '../../lib/designPresets'
import Icon from '../Icon'

// Each quick choice changes one aspect of the design.
export function FontPicker({ value, options, onChange }) {
  return <fieldset className="design-fonts"><legend className="text-sm font-semibold">Font</legend>
    <div className="design-choice-grid">{options.map((option) => <button type="button" key={option.id} aria-label={`${option.name} font`} aria-pressed={value === option.id} onClick={() => onChange(option.id)}>
      <span aria-hidden="true" className="design-font-sample" style={{ fontFamily: option.family }}>Aa</span><span>{option.name}</span>
    </button>)}</div>
    {!options.some((option) => option.id === value) && <p className="design-help">Custom font selected. Your choice is available in Advanced.</p>}
  </fieldset>
}

export function LayoutPicker({ value, onChange }) {
  const options = [['template', 'Original'], ['one', 'One column'], ['two', 'Two columns'], ['mixed', 'Mixed']]
  const descriptions = {template:'Keep the layout supplied by your template.',one:'Arrange all sections in one column.',two:'Arrange sections across two columns.',mixed:'Use a full-width introduction with columns below.'}
  return <fieldset><legend className="text-sm font-semibold">Layout</legend><div className="section-layout-choices">{options.map(([id, label]) => <button type="button" key={id} aria-label={`${label} layout`} aria-pressed={value === id} onClick={() => onChange(id)}><span className="layout-choice-heading"><span>{label}</span>{value === id && <span className="layout-choice-selected">Selected</span>}</span><span className="layout-choice-description">{descriptions[id]}</span></button>)}</div></fieldset>
}

export function SpacingPicker({ options, value, onChange }) {
  return <fieldset className="design-spacing"><legend className="text-sm font-semibold">Spacing</legend><div className="design-spacing-grid">{options.map((option, index) => <button type="button" key={option.id} aria-label={`${option.name} spacing`} aria-pressed={matchesPreset(value, option.values)} onClick={() => onChange(option.values)}><span aria-hidden="true" className="design-spacing-icon" style={{ gap: 3 + index * 3 }}>{[0, 1, 2].map((line) => <i key={line} />)}</span><span>{option.name}</span></button>)}</div><p className="design-help">{options.some((option) => matchesPreset(value, option.values)) ? 'Adjust exact spacing in Advanced.' : 'Custom spacing. Choose a preset or adjust it in Advanced.'}</p></fieldset>
}

export function DesignHistory({ undo, redo, canUndo, canRedo }) {
  return <div role="group" aria-label="Style history" className="design-history"><button type="button" onClick={undo} disabled={!canUndo}><Icon name="undo" className="h-4 w-4" /><span>Undo styling</span></button><button type="button" onClick={redo} disabled={!canRedo}><Icon name="redo" className="h-4 w-4" /><span>Redo styling</span></button></div>
}
