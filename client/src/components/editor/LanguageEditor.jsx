import SummaryEditor from './SummaryEditor'
import { languageLevels } from '../../lib/additionalSections'
export default function LanguageEditor({ entry, onChange, onDone, onDelete }) {
  return (
    <SummaryEditor
      entry={entry}
      onChange={onChange}
      onDone={onDone}
      onDelete={onDelete}
      title="Edit language entry"
      label="Additional information"
      autofocus={false}
      afterContent={
        <label className="mt-5 block text-sm font-semibold">
          Language level
          <select
            value={entry.level}
            onChange={(event) =>
              onChange({ ...entry, level: event.target.value })
            }
            className="mt-2 min-h-12 w-full border border-line bg-paper px-3 text-sm font-normal"
          >
            <option value="">No level displayed</option>
            {languageLevels.map((level) => (
              <option key={level}>{level}</option>
            ))}
          </select>
        </label>
      }
    >
      <label className="mb-5 block text-sm font-semibold">
        Language
        <input
          autoFocus
          value={entry.name}
          onChange={(event) => onChange({ ...entry, name: event.target.value })}
          maxLength={160}
          placeholder="e.g. English, Burmese, or Spanish"
          className="mt-2 min-h-12 w-full border border-line bg-paper px-3 text-sm font-normal"
        />
      </label>
    </SummaryEditor>
  )
}
