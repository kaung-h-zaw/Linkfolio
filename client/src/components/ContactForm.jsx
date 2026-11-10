import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Icon from './Icon'
import { api } from '../lib/api'
export default function ContactForm({ slug }) {
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState('')
  const [sent, setSent] = useState(false)
  useEffect(() => {
    if (!sent) return
    const timer = setTimeout(() => { setSent(false); setResult('') }, 8000)
    return () => clearTimeout(timer)
  }, [sent])
  async function submit(event) {
    event.preventDefault()
    if (busy) return
    const form = event.currentTarget
    const body = Object.fromEntries(new FormData(form))
    setBusy(true)
    setResult('')
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
      setResult(error.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <form onSubmit={submit} className="mt-8 max-w-xl space-y-4">
      <h3 className="text-lg font-semibold">Send a message</h3>
      <label className="block text-sm">
        Your name
        <input
          name="name"
          autoComplete="name"
          required
          maxLength={120}
          className="mt-2 min-h-11 w-full rounded border border-line bg-white px-3 text-ink"
        />
      </label>
      <label className="block text-sm">
        Your email
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          className="mt-2 min-h-11 w-full rounded border border-line bg-white px-3 text-ink"
        />
      </label>
      <label className="block text-sm">
        Message
        <textarea
          name="message"
          required
          maxLength={5000}
          rows={5}
          className="mt-2 w-full rounded border border-line bg-white p-3 text-ink"
        />
      </label>
      <label aria-hidden="true" className="hidden">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <button disabled={busy} className="button button-green disabled:opacity-50">
        {busy ? 'Sending…' : 'Send message'}
      </button>
      {sent && createPortal(
        <div role="status" aria-live="polite" className="fixed right-5 bottom-5 left-5 z-50 flex items-start gap-3 rounded-xl border border-line bg-white p-5 text-ink shadow-xl sm:left-auto sm:w-96">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sage text-accent"><Icon name="check" className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1"><p className="font-semibold">Message sent</p><p className="mt-1 text-sm leading-6 text-muted">{result}</p></div>
          <button type="button" onClick={() => { setSent(false); setResult('') }} aria-label="Dismiss message confirmation" className="grid h-8 w-8 shrink-0 place-items-center rounded hover:bg-paper"><Icon name="close" className="h-4 w-4" /></button>
        </div>, document.body
      )}
      {result && !sent && (
        <p role="status" className="text-sm">
          {result}
        </p>
      )}
    </form>
  )
}
