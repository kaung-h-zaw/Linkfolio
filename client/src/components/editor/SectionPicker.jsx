import Icon from '../Icon'

export default function SectionPicker({ sections, value, onChange }) {
  return <fieldset className="section-picker" aria-label="Section to customize">
    <legend className="section-picker-label">Section</legend>
    <div className="section-picker-options">
      {sections.map(({ key, title }) => <button
        key={key}
        type="button"
        data-section-choice={key}
        aria-label={`Select ${title} section`}
        aria-pressed={value === key}
        onClick={() => onChange(key)}
      >
        <Icon name={key} className="h-4 w-4" />
        <span>{title}</span>
        {value === key && <Icon name="check" className="h-4 w-4" />}
      </button>)}
    </div>
  </fieldset>
}
