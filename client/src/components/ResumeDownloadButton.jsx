import { useState } from 'react'
import Icon from './Icon'

export default function ResumeDownloadButton({
  profile,
  label = 'Download resume',
  shortLabel = 'Resume',
  showIcon = true,
  className = '',
  buttonClassName = 'portfolio-contact-link',
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function download() {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const { downloadResume } = await import('../lib/downloadResume')
      await downloadResume(profile)
    } catch {
      setError('Could not download your resume. Please try again.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <span className={className}>
      <button
        type="button"
        className={buttonClassName}
        onClick={download}
        disabled={busy}
        aria-busy={busy}
        title={busy ? 'Preparing PDF' : label}
        aria-label={busy ? 'Preparing PDF' : 'Download resume'}
      >
        <span className="resume-download-label">{busy ? 'Preparing PDF…' : label}</span>
        <span className="resume-download-short">{busy ? 'Preparing…' : shortLabel}</span>{' '}
        {showIcon && <Icon name="download" className="h-4 w-4" />}
      </button>
      {error && (
        <span role="alert" className="mt-2 block text-xs">
          {error}
        </span>
      )}
    </span>
  )
}
