import { useEffect, useId, useState } from 'react'
import Icon from './Icon'
import { api } from '../services/api'
export default function ContactForm({ slug, preview = false }) {
  const previewHint = useId()
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState('')
  const [errorTitle, setErrorTitle] = useState('')
  const [sent, setSent] = useState(false)
  useEffect(() => {
    if (!sent) return
    const timer = setTimeout(() => { setSent(false); setResult('') }, 8000)
    return () => clearTimeout(timer)
  }, [sent])
  async function submit(event) {
    event.preventDefault()
    if (busy || preview || !slug) return
    const form = event.currentTarget
    const body = Object.fromEntries(new FormData(form))
    setBusy(true)
    setResult('')
    setErrorTitle('')
    setSent(false)
    try {
      const data = await api(`/public/portfolios/${encodeURIComponent(slug)}/messages`, {
        method: 'POST',
        body,
      })
      setResult(data.message)
      setSent(true)
      form.reset()
    } catch (error) {
      if (error.status === 429 || error.code === 'RATE_LIMITED') {
        const minutes = Math.max(1, Math.ceil((error.retryAfterSeconds || 60) / 60))
        setErrorTitle('Please wait before sending again')
        setResult(`To prevent spam, this form temporarily limits repeated messages. Try again in about ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}. Your message has not been cleared.`)
      } else {
        setErrorTitle('Message could not be sent')
        setResult(error.message)
      }
    } finally {
      setBusy(false)
    }
  }
  return (
    <form onSubmit={submit} className="portfolio-contact-form" aria-label="Send a message" aria-describedby={preview ? previewHint : undefined} data-preview={preview || undefined}>
      <div className="portfolio-form-heading">
        <span className="portfolio-form-heading-icon" aria-hidden="true"><Icon name="edit" className="h-5 w-5" /></span>
        <div><h3>Send a message</h3><p>Tell me what you’re working on.</p></div>
      </div>
      <div className="portfolio-form-row">
        <label className="portfolio-form-field">
          <span>Your name</span>
          <input name="name" autoComplete="name" required maxLength={120} placeholder="Your name" />
        </label>
        <label className="portfolio-form-field">
          <span>Your email</span>
          <input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" />
        </label>
      </div>
      <label className="portfolio-form-field">
        <span>Message</span>
        <textarea name="message" required maxLength={5000} rows={5} placeholder="A little about your project, idea, or question…" />
      </label>
      <label aria-hidden="true" className="hidden">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <button type="submit" disabled={busy || preview} aria-busy={busy} className="portfolio-button portfolio-send-button">
        <span>{busy ? 'Sending…' : 'Send message'}</span>
        {busy ? <span className="portfolio-send-spinner" aria-hidden="true" /> : <Icon name="arrow" className="h-4 w-4" />}
      </button>
      {preview && <p id={previewHint} className="portfolio-form-preview-note">Visitors can send messages from your published portfolio.</p>}
      {sent && <div role="status" aria-live="polite" className="portfolio-form-feedback portfolio-form-feedback--success">
        <Icon name="check" className="h-5 w-5" />
        <div><p className="portfolio-form-feedback-title">Message sent</p><p>{result}</p></div>
        <button type="button" onClick={() => { setSent(false); setResult('') }} aria-label="Dismiss message confirmation"><Icon name="close" className="h-4 w-4" /></button>
      </div>}
      {result && !sent && <div role="alert" className="portfolio-form-feedback portfolio-form-feedback--error">
        <Icon name="clock" className="h-5 w-5" />
        <div><p className="portfolio-form-feedback-title">{errorTitle}</p><p>{result}</p></div>
      </div>}
    </form>
  )
}
