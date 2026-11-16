import SummaryEditor from './SummaryEditor'

export default function ExtraContentEditor({
  entry,
  onChange,
  onDone,
  onDelete,
  title = 'Edit content entry',
  titleLabel = 'Entry title (optional)',
}) {
  return (
    <SummaryEditor
      entry={entry}
      onChange={onChange}
      onDone={onDone}
      onDelete={onDelete}
      title={title}
      label="Details"
      autofocus={false}
    >
      <label className="mb-5 block text-sm font-semibold">
        {titleLabel}
        <input
          autoFocus
          value={entry.name}
          maxLength={160}
          onChange={(event) => onChange({ ...entry, name: event.target.value })}
          className="mt-2 min-h-12 w-full border border-line bg-paper px-3 text-sm font-normal"
        />
      </label>
    </SummaryEditor>
  )
}

export function CustomSkillsEditor(props) { return <ExtraContentEditor {...props} title="Edit skill group" titleLabel="Group heading" /> }
