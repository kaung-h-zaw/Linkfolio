import { useRef, useState } from 'react'
import SummaryEditor from './SummaryEditor'
import Icon from '../Icon'
import { profileLinkHref } from '../../lib/profileLinks'

export default function ExperienceEditor({
  entry,
  onChange,
  onDone,
  onDelete,
}) {
  const [linkOpen, setLinkOpen] = useState(false)
  const [url, setUrl] = useState(entry.employerUrl)
  const [urlError, setUrlError] = useState('')
  const endInput = useRef(null)
  const invalidDates =
    !entry.current &&
    entry.startDate &&
    entry.endDate &&
    entry.endDate < entry.startDate
  function update(key, value) {
    onChange({ ...entry, [key]: value })
  }
  function done() {
    if (invalidDates) {
      endInput.current?.reportValidity()
      return
    }
    onDone()
  }
  function apply() {
    if (url.trim() && !profileLinkHref(url)) {
      setUrlError('Enter a valid web address.')
      return
    }
    update('employerUrl', url.trim())
    setLinkOpen(false)
  }
  const inputClass =
    'mt-2 min-h-12 w-full min-w-0 border border-line bg-paper px-3 text-sm font-normal'
  return (
    <SummaryEditor
      entry={entry}
      onChange={onChange}
      onDone={done}
      onDelete={onDelete}
      title="Edit experience entry"
      label="Description"
      autofocus={false}
    >
      <div className="mb-6 space-y-5">
        <label className="block text-sm font-semibold">
          Job title
          <input
            autoFocus
            value={entry.jobTitle}
            maxLength={160}
            onChange={(event) => update('jobTitle', event.target.value)}
            placeholder="e.g. Frontend Developer"
            className={inputClass}
          />
        </label>
        <div>
          <label
            htmlFor={`employer-${entry.id}`}
            className="text-sm font-semibold"
          >
            Employer
          </label>
          <div className="mt-2 flex items-center gap-2 rounded-md border border-line bg-paper pr-2">
            <input
              id={`employer-${entry.id}`}
              value={entry.company}
              maxLength={160}
              onChange={(event) => update('company', event.target.value)}
              placeholder="Company or organization"
              className="min-h-12 min-w-0 flex-1 !border-0 bg-transparent px-3 text-sm"
            />
            <button
              type="button"
              aria-label="Edit employer link"
              aria-expanded={linkOpen}
              onClick={() => {
                setUrl(entry.employerUrl)
                setUrlError('')
                setLinkOpen(!linkOpen)
              }}
              className="flex min-h-9 shrink-0 items-center gap-1.5 rounded border border-line bg-white px-3 text-xs text-accent"
            >
              <Icon name="link" className="h-3.5 w-3.5" />
              Link
            </button>
          </div>
          {linkOpen && (
            <div
              className="mt-2 rounded-md border border-line bg-white p-3 shadow-sm"
              onKeyDown={(event) => {
                if (event.key === 'Escape') setLinkOpen(false)
                if (event.key === 'Enter') {
                  event.preventDefault()
                  apply()
                }
              }}
            >
              <label className="text-xs font-semibold">
                Employer URL
                <input
                  autoFocus
                  type="text"
                  inputMode="url"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://company.com"
                  className={inputClass}
                />
              </label>
              {urlError && (
                <p role="alert" className="mt-2 text-xs text-red-700">
                  {urlError}
                </p>
              )}
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={apply}
                  className="min-h-9 rounded bg-accent px-3 text-xs text-white"
                >
                  Apply employer link
                </button>
                <button
                  type="button"
                  onClick={() => setLinkOpen(false)}
                  className="min-h-9 px-3 text-xs text-muted"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          <label className="min-w-0 text-sm font-semibold">
            Start date
            <input
              type="month"
              value={entry.startDate}
              onChange={(event) => update('startDate', event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="min-w-0 text-sm font-semibold">
            End date
            <input
              ref={(node) => {
                endInput.current = node
                node?.setCustomValidity(
                  invalidDates
                    ? 'End date must be on or after start date.'
                    : '',
                )
              }}
              type="month"
              value={entry.current ? '' : entry.endDate}
              min={entry.startDate || undefined}
              disabled={entry.current}
              onChange={(event) => update('endDate', event.target.value)}
              aria-invalid={invalidDates ? true : undefined}
              aria-describedby={
                invalidDates ? 'experience-date-error' : undefined
              }
              className={`${inputClass} disabled:opacity-40`}
            />
          </label>
        </div>
        {invalidDates && (
          <p
            id="experience-date-error"
            role="alert"
            className="text-xs text-red-700"
          >
            End date must be on or after start date.
          </p>
        )}
        <label className="flex min-h-9 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={entry.current}
            onChange={(event) => update('current', event.target.checked)}
            className="h-4 w-4 accent-accent"
          />
          I currently work here
        </label>
        <label className="block text-sm font-semibold">
          Location
          <input
            value={entry.location}
            maxLength={160}
            onChange={(event) => update('location', event.target.value)}
            placeholder="City, Country or Remote"
            className={inputClass}
          />
        </label>
      </div>
    </SummaryEditor>
  )
}
