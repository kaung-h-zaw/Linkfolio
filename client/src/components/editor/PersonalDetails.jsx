import { useRef } from 'react'
import Icon from '../Icon'
import ResumePhotoField from './ResumePhotoField'
import ProfileLinksFields from './ProfileLinksFields'
import { getProfileLinks } from '../../lib/profileLinks'
import { resumePhotoSource } from '../../lib/resumePhoto'

const fields = [
  ['fullName', 'Full name', 'text', 'Alex Morgan', 'name'],
  [
    'headline',
    'Professional title',
    'text',
    'Product Designer',
    'organization-title',
  ],
  ['email', 'Email', 'email', 'alex@example.com', 'email'],
  ['phone', 'Phone', 'tel', '+1 555 012 3456', 'tel'],
  ['location', 'Location', 'text', 'City, Country', 'address-level2'],
]

export default function PersonalDetails({
  personal,
  onChange,
  editing,
  onEditingChange,
}) {
  const links = getProfileLinks(personal)
  const editButton = useRef(null)
  const firstInput = useRef(null)
  const panel = useRef(null)
  function open() {
    onEditingChange(true)
    requestAnimationFrame(() => {
      firstInput.current?.focus({ preventScroll: true })
      panel.current?.scrollIntoView({ block: 'start' })
    })
  }
  function done(event) {
    event.preventDefault()
    onEditingChange(false)
    requestAnimationFrame(() => {
      editButton.current?.focus({ preventScroll: true })
      panel.current?.scrollIntoView({ block: 'start' })
    })
  }
  function input(key, label, type, placeholder, autoComplete, first = false) {
    return (
      <label key={key} className="block text-sm font-medium text-ink">
        {label}
        <input
          ref={first ? firstInput : undefined}
          name={key}
          type={type}
          autoComplete={autoComplete}
          value={personal[key] || ''}
          maxLength={key === 'headline' ? 200 : 120}
          placeholder={placeholder}
          onChange={(event) =>
            onChange({ ...personal, [key]: event.target.value })
          }
          className="mt-2 min-h-12 w-full min-w-0 border border-line bg-paper px-3 py-2 text-sm font-normal text-ink placeholder:text-slate-400"
        />
      </label>
    )
  }
  if (editing)
    return (
      <form
        ref={panel}
        onSubmit={done}
        className="personal-edit-form rounded-lg border border-line bg-white shadow-sm"
      >
        <div className="personal-form-fields">
          <h1 className="text-xl font-semibold tracking-tight">Personal details</h1>
          <div className="personal-identity-fields">
            <fieldset className="space-y-5">
              <legend className="sr-only">Name and title</legend>
              {fields.slice(0, 2).map(([key, label, type, placeholder, autoComplete], index) => input(key, label, type, placeholder, autoComplete, index === 0))}
            </fieldset>
            <ResumePhotoField personal={personal} onChange={onChange} />
          </div>
          <fieldset className="mt-6 space-y-5">
            <legend className="sr-only">Contact details</legend>
            {fields.slice(2).map(([key, label, type, placeholder, autoComplete]) => input(key, label, type, placeholder, autoComplete))}
          </fieldset>
          <fieldset className="mt-8 space-y-5 border-t border-line pt-6">
            <legend className="float-left mb-5 w-full text-sm font-semibold">
              Links{' '}
              <span className="ml-1 font-normal text-muted">(optional)</span>
            </legend>
            <ProfileLinksFields
              links={links}
              onChange={(value) => onChange({ ...personal, links: value })}
            />
          </fieldset>
        </div>
        <div className="editor-form-footer">
          <button
            type="submit"
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-accent text-sm font-semibold text-white hover:bg-accent-hover"
          >
            <Icon name="check" className="h-4 w-4" />
            Done
          </button>
        </div>
      </form>
    )
  const contact = [
    ['mail', personal.email],
    ['phone', personal.phone],
    ['location', personal.location],
  ].filter(([, value]) => value?.trim())
  const photo = resumePhotoSource(personal.photo)
  return (
    <section ref={panel} aria-label="Personal details" className={`personal-overview editor-content-card${photo ? ' has-photo' : ''}`}>
      <div className="personal-summary">
        <h2>{personal.fullName || 'Your name'}</h2>
        {personal.headline?.trim() && <p className="personal-headline">{personal.headline}</p>}
        {contact.length > 0 && <div className="personal-contact">
          {contact.map(([icon, value]) => <p key={icon} data-contact={icon}>
            <Icon name={icon} className="h-4 w-4" />
            <span>{value}</span>
          </p>)}
        </div>}
      </div>
      {photo && <img src={photo} alt="Your profile photo" className="personal-photo" />}
      <button ref={editButton} type="button" onClick={open} aria-label="Edit personal details" className="personal-card-open">
        <span className="personal-edit-button" aria-hidden="true"><Icon name="edit" className="h-4 w-4" /><span>Edit</span></span>
      </button>
    </section>
  )
}
