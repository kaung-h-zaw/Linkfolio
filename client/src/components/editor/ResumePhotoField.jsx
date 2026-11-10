import { useLayoutEffect, useRef, useState } from 'react'
import { readResumePhoto, resumePhotoSource } from '../../lib/resumePhoto'
import Icon from '../Icon'

export default function ResumePhotoField({ personal, onChange }) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const latest = useRef(null)
  const fileInput = useRef(null)
  useLayoutEffect(() => { latest.current = { personal, onChange } }, [personal, onChange])
  const request = useRef(0)
  const photo = resumePhotoSource(personal.photo)
  async function upload(event) {
    const file = event.target.files[0]
    event.target.value = ''
    if (!file) return
    const id = ++request.current
    setError('')
    setBusy(true)
    try {
      const value = await readResumePhoto(file)
      if (id === request.current) latest.current.onChange({ ...latest.current.personal, photo: value })
    } catch (failure) {
      if (id === request.current) setError(failure.message || 'This photo could not be opened.')
    } finally {
      if (id === request.current) setBusy(false)
    }
  }
  return (
    <div className="resume-photo-field">
      <span className="photo-field-label">Photo</span>
      <input ref={fileInput} type="file" aria-label="Resume photo (optional)" accept="image/jpeg,image/png,image/webp" onChange={upload} disabled={busy} className="sr-only" tabIndex={-1} />
      <button type="button" className="photo-upload-target" aria-label={photo ? 'Change resume photo' : 'Add resume photo'} aria-busy={busy} disabled={busy} onClick={() => fileInput.current?.click()}>
        {photo ? <img src={photo} alt="Your uploaded resume photo" /> : <Icon name="camera" className="h-7 w-7" />}
        <span className="photo-upload-caption">{busy ? 'Preparing…' : photo ? 'Change' : 'Add photo'}</span>
      </button>
      {busy && <p role="status" className="text-xs text-muted">Preparing photo…</p>}
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
      {photo && <div>
        <button type="button" onClick={() => {
          request.current += 1
          setBusy(false)
          setError('')
          onChange({ ...personal, photo: '' })
        }} className="text-xs font-medium text-accent underline">Remove photo</button>
      </div>}
    </div>
  )
}
