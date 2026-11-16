import { useRef, useState } from 'react'
import SummaryEditor from './SummaryEditor'
import Icon from '../Icon'
import { profileLinkHref } from '../../lib/profileLinks'

export default function ProjectCertificationEditor({
  entry,
  onChange,
  onDone,
  onDelete,
  kind,
}) {
  const certification = kind === 'certification'
  const title = certification ? 'Certificate' : 'Project title'
  const from = certification ? 'issueDate' : 'startDate'
  const to = certification ? 'expiryDate' : 'endDate'
  const flag = certification ? 'noExpiry' : 'current'
  const [linkOpen, setLinkOpen] = useState(false)
  const [url, setUrl] = useState(entry.url)
  const [error, setError] = useState('')
  const endInput = useRef(null)
  const linkButton = useRef(null)
  const invalid =
    !entry[flag] && entry[from] && entry[to] && entry[to] < entry[from]
  const dateError = certification
    ? 'Expiry date must be on or after issue date.'
    : 'End date must be on or after start date.'
  const inputClass =
    'mt-2 min-h-12 w-full min-w-0 border border-line bg-paper px-3 text-sm font-normal'
  function update(key, value) {
    onChange({ ...entry, [key]: value })
  }
  function closeLink() {
    setLinkOpen(false)
    linkButton.current?.focus()
  }
  function apply() {
    if (url.trim() && !profileLinkHref(url)) {
      setError('Enter a valid web address.')
      return
    }
    update('url', url.trim())
    closeLink()
  }
  return (
    <SummaryEditor
      entry={entry}
      onChange={onChange}
      onDone={() => {
        if (invalid) {
          endInput.current?.reportValidity()
          return
        }
        onDone()
      }}
      onDelete={onDelete}
      title={`Edit ${kind} entry`}
      label={certification ? 'Additional information' : 'Description'}
      autofocus={false}
    >
      <div className="mb-6 space-y-5">
        <div>
          <label
            htmlFor={`title-${entry.id}`}
            className="text-sm font-semibold"
          >
            {title}
          </label>
          <div className="mt-2 flex items-center gap-2 rounded-md border border-line bg-paper pr-2">
            <input
              autoFocus
              id={`title-${entry.id}`}
              value={entry.name}
              maxLength={200}
              onChange={(event) => update('name', event.target.value)}
              placeholder={certification ? 'Certificate name' : 'Project name'}
              className="min-h-12 min-w-0 flex-1 !border-0 bg-transparent px-3 text-sm"
            />
            <button
              ref={linkButton}
              type="button"
              aria-label={`Edit ${kind} link`}
              aria-expanded={linkOpen}
              onClick={() => {
                setUrl(entry.url)
                setError('')
                setLinkOpen(!linkOpen)
              }}
              className="flex min-h-9 items-center gap-1.5 rounded border border-line bg-white px-3 text-xs text-accent"
            >
              <Icon name="link" className="h-3.5 w-3.5" />
              Link
            </button>
          </div>
          {linkOpen && (
            <div
              className="mt-2 rounded-md border border-line p-3 shadow-sm"
              onKeyDown={(event) => {
                if (event.key === 'Escape') closeLink()
                if (event.key === 'Enter') {
                  event.preventDefault()
                  apply()
                }
              }}
            >
              <label className="text-xs font-semibold">
                {certification ? 'Credential URL' : 'Project URL'}
                <input
                  autoFocus
                  value={url}
                  inputMode="url"
                  onChange={(event) => {
                    setUrl(event.target.value)
                    setError('')
                  }}
                  placeholder="https://example.com"
                  className={inputClass}
                />
              </label>
              {error && (
                <p role="alert" className="mt-2 text-xs text-red-700">
                  {error}
                </p>
              )}
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={apply}
                  className="min-h-9 rounded bg-accent px-3 text-xs text-white"
                >
                  Apply URL
                </button>
                <button
                  type="button"
                  onClick={closeLink}
                  className="min-h-9 px-3 text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        <label className="block text-sm font-semibold">
          {certification ? 'Issuer' : 'Subtitle'}
          <input
            value={entry[certification ? 'issuer' : 'subtitle']}
            maxLength={200}
            onChange={(event) =>
              update(certification ? 'issuer' : 'subtitle', event.target.value)
            }
            placeholder={
              certification
                ? 'Issuing organization'
                : 'Your role, technologies, or a short tagline'
            }
            className={inputClass}
          />
        </label>
        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          <label className="min-w-0 text-sm font-semibold">
            {certification ? 'Issue date' : 'Start date'}
            <input
              type="month"
              value={entry[from]}
              onChange={(event) => update(from, event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="min-w-0 text-sm font-semibold">
            {certification ? 'Expiry date' : 'End date'}
            <input
              ref={(node) => {
                endInput.current = node
                node?.setCustomValidity(invalid ? dateError : '')
              }}
              type="month"
              min={entry[from] || undefined}
              disabled={entry[flag]}
              value={entry[flag] ? '' : entry[to]}
              onChange={(event) => update(to, event.target.value)}
              aria-invalid={invalid ? true : undefined}
              aria-describedby={invalid ? `dates-${entry.id}` : undefined}
              className={`${inputClass} disabled:opacity-40`}
            />
          </label>
        </div>
        {invalid && (
          <p
            id={`dates-${entry.id}`}
            role="alert"
            className="text-xs text-red-700"
          >
            {dateError}
          </p>
        )}
        <label className="flex min-h-9 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={entry[flag]}
            onChange={(event) => update(flag, event.target.checked)}
            className="h-4 w-4 accent-accent"
          />
          {certification ? 'Does not expire' : 'Ongoing project'}
        </label>
        {!certification && (
          <label className="block text-sm font-semibold">
            Repository URL{' '}
            <span className="font-normal text-muted">(optional)</span>
            <input
              value={entry.github}
              onChange={(event) => update('github', event.target.value)}
              inputMode="url"
              placeholder="https://github.com/yourname/project"
              className={inputClass}
            />
          </label>
        )}
      </div>
    </SummaryEditor>
  )
}
