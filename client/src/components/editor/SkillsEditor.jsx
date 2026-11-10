import SummaryEditor from './SummaryEditor'
import { skillLevels } from '../../lib/educationSkills'
export default function SkillsEditor({ entry, onChange, onDone, onDelete }) {
  return (
    <SummaryEditor
      entry={entry}
      onChange={onChange}
      onDone={onDone}
      onDelete={onDelete}
      title="Edit skill entry"
      label="Information / Sub-skills"
      autofocus={false}
      afterContent={
        <label className="mt-5 block text-sm font-semibold">
          Skill level
          <select
            value={entry.level}
            onChange={(event) =>
              onChange({ ...entry, level: event.target.value })
            }
            className="mt-2 min-h-12 w-full border border-line bg-paper px-3 text-sm font-normal"
          >
            <option value="">No level displayed</option>
            {skillLevels.map((level) => (
              <option key={level}>{level}</option>
            ))}
          </select>
        </label>
      }
    >
      <label className="mb-5 block text-sm font-semibold">
        Skill
        <input
          autoFocus
          value={entry.name}
          onChange={(event) => onChange({ ...entry, name: event.target.value })}
          maxLength={160}
          placeholder="e.g. Core & Frameworks, or React"
          className="mt-2 min-h-12 w-full border border-line bg-paper px-3 text-sm font-normal"
        />
      </label>
    </SummaryEditor>
  )
}
