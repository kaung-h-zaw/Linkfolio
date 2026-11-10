import { useId, useRef, useState } from 'react'
import Icon from './Icon'

function Field({
  label,
  type = 'text',
  value,
  onChange,
  disabled = false,
  options,
}) {
  const id = useId()
  const props = {
    id,
    value: value || '',
    disabled,
    onChange: (event) => onChange(event.target.value),
    className:
      'min-h-11 w-full min-w-0 rounded-md border border-line bg-white px-3 py-2.5 text-base disabled:bg-paper disabled:text-muted focus:border-accent',
  }
  return (
    <div className={type === 'textarea' ? 'sm:col-span-2' : ''}>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      {type === 'textarea' ? (
        <textarea {...props} rows={3} />
      ) : options ? (
        <select {...props}>
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input {...props} type={type} />
      )}
    </div>
  )
}

export function PersonalInfoForm({ value, onChange }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[
        ['fullName', 'Full Name'],
        ['headline', 'Professional Headline'],
        ['email', 'Email', 'email'],
        ['phone', 'Phone', 'tel'],
        ['location', 'Location'],
        ['website', 'Website', 'url'],
        ['summary', 'Short Bio / Profile Summary', 'textarea'],
      ].map(([key, label, type]) => (
        <Field
          key={key}
          label={label}
          type={type}
          value={value[key]}
          onChange={(next) => onChange({ ...value, [key]: next })}
        />
      ))}
    </div>
  )
}

const definitions = {
  custom: {
    singular: 'Custom Section',
    title: 'title',
    fields: [
      ['title', 'Section Heading'],
      ['content', 'Content', 'textarea'],
    ],
  },
  experience: {
    singular: 'Experience',
    title: 'jobTitle',
    fields: [
      ['jobTitle', 'Job Title'],
      ['company', 'Company'],
      ['location', 'Location'],
      ['startDate', 'Start Date', 'month'],
      ['endDate', 'End Date', 'month'],
      ['description', 'Description', 'textarea'],
    ],
  },
  education: {
    singular: 'Education',
    title: 'institution',
    fields: [
      ['institution', 'Institution'],
      ['degree', 'Degree'],
      ['field', 'Field of Study'],
      ['startDate', 'Start Date', 'month'],
      ['endDate', 'End Date', 'month'],
      ['description', 'Description', 'textarea'],
    ],
  },
  projects: {
    singular: 'Project',
    title: 'name',
    fields: [
      ['name', 'Project Name'],
      ['technologies', 'Technologies'],
      ['description', 'Description', 'textarea'],
      ['github', 'GitHub URL', 'url'],
      ['url', 'Live URL', 'url'],
    ],
  },
  certificates: {
    singular: 'Certificate',
    title: 'name',
    fields: [
      ['name', 'Certificate Name'],
      ['issuer', 'Issuer'],
      ['issueDate', 'Issue Date', 'month'],
      ['url', 'Credential URL', 'url'],
    ],
  },
  links: {
    singular: 'Link',
    title: 'label',
    fields: [
      ['label', 'Link Type', 'select'],
      ['url', 'URL', 'url'],
    ],
  },
}

export function EntryForm({ section, items, onChange }) {
  const definition = definitions[section]
  const [editing, setEditing] = useState([])
  const addButton = useRef(null)
  function update(id, key, value) {
    onChange(
      items.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
    )
  }
  function add() {
    const id = crypto.randomUUID()
    onChange([
      ...items,
      { id, ...(section === 'links' ? { label: 'LinkedIn' } : {}) },
    ])
    setEditing([...editing, id])
  }
  return (
    <div className="space-y-4">
      {items.length === 0 && (
        <p className="text-sm leading-6 text-muted">
          No {section} added yet. Start with one entry, or come back later.
        </p>
      )}
      {items.map((item, index) => (
        <div key={item.id} className="rounded-md border border-line p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="min-w-0 break-words text-sm font-semibold">
              {item[definition.title]?.trim() ||
                `${definition.singular} ${index + 1}`}
            </h3>
            <div className="flex gap-1">
              <button
                type="button"
                aria-expanded={editing.includes(item.id)}
                aria-controls={`entry-${item.id}`}
                onClick={() =>
                  setEditing(
                    editing.includes(item.id)
                      ? editing.filter((id) => id !== item.id)
                      : [...editing, item.id],
                  )
                }
                className="min-h-11 px-2 text-xs font-medium text-accent"
              >
                {editing.includes(item.id) ? 'Done' : 'Edit'}
                <span className="sr-only">
                  {' '}
                  {definition.singular} {index + 1}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onChange(items.filter((entry) => entry.id !== item.id))
                  setEditing(editing.filter((id) => id !== item.id))
                  addButton.current?.focus()
                }}
                className="min-h-11 px-2 text-xs text-red-700"
              >
                Remove
                <span className="sr-only">
                  {' '}
                  {definition.singular} {index + 1}
                </span>
              </button>
            </div>
          </div>
          <div id={`entry-${item.id}`} hidden={!editing.includes(item.id)}>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {definition.fields.map(([key, label, type]) => (
                <Field
                  key={key}
                  label={label}
                  type={type}
                  value={item[key]}
                  disabled={
                    section === 'experience' &&
                    key === 'endDate' &&
                    item.current
                  }
                  options={
                    type === 'select'
                      ? [
                          'LinkedIn',
                          'GitHub',
                          'Personal Website',
                          'Behance',
                          'Dribbble',
                          'Other',
                        ]
                      : undefined
                  }
                  onChange={(value) => update(item.id, key, value)}
                />
              ))}
            </div>
            {section === 'experience' && (
              <label className="mt-4 flex min-h-11 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(item.current)}
                  onChange={(event) =>
                    update(item.id, 'current', event.target.checked)
                  }
                  className="h-4 w-4 accent-accent"
                />
                Currently Working
              </label>
            )}
            {item.startDate &&
              item.endDate &&
              !item.current &&
              item.endDate < item.startDate && (
                <p role="status" className="mt-3 text-xs text-red-700">
                  End date should be on or after the start date.
                </p>
              )}
          </div>
        </div>
      ))}
      <button
        ref={addButton}
        type="button"
        onClick={add}
        className="button button-outline w-full !text-xs"
      >
        <Icon name="plus" className="h-4 w-4" />Add {definition.singular}
      </button>
    </div>
  )
}

export function SkillsForm({ skills, onChange }) {
  const [draft, setDraft] = useState('')
  const [message, setMessage] = useState('')
  const input = useRef(null)
  function add(event) {
    event.preventDefault()
    const skill = draft.trim()
    if (!skill) {
      setMessage('Enter a skill to add.')
      input.current?.focus()
      return
    }
    if (skills.some((value) => value.toLowerCase() === skill.toLowerCase())) {
      setMessage('That skill is already on your profile.')
      return
    }
    onChange([...skills, skill])
    setDraft('')
    setMessage('')
    input.current?.focus()
  }
  return (
    <div>
      <form onSubmit={add}>
        <label htmlFor="new-skill" className="mb-2 block text-sm font-medium">
          Add a skill
        </label>
        <div className="flex gap-2">
          <input
            ref={input}
            id="new-skill"
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value)
              setMessage('')
            }}
            placeholder="e.g. React"
            aria-describedby="skill-message"
            className="min-h-11 min-w-0 flex-1 rounded-md border border-line px-3 text-base"
          />
          <button type="submit" className="button button-outline !px-4">
            Add
          </button>
        </div>
        <p id="skill-message" role="status" className="mt-2 text-xs text-muted">
          {message || 'Add one skill at a time. Press Enter to add.'}
        </p>
      </form>
      <ul className="mt-4 flex flex-wrap gap-2">
        {skills.map((skill) => (
          <li
            key={skill}
            className="flex max-w-full items-center gap-1 rounded-md bg-sage/60 pl-3 text-xs text-accent"
          >
            <span className="min-w-0 break-words">{skill}</span>
            <button
              type="button"
              aria-label={`Remove skill ${skill}`}
              onClick={() => {
                onChange(skills.filter((value) => value !== skill))
                input.current?.focus()
              }}
              className="flex h-11 w-9 shrink-0 items-center justify-center"
            >
              <Icon name="close" className="h-3 w-3" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
