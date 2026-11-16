import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'

export default function DeleteAccountDialog({ fullName, onConfirm, onClose }) {
  const dialog = useRef(null)
  const input = useRef(null)
  const [confirmation, setConfirmation] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const matches = confirmation.trim().toLocaleLowerCase() === fullName.trim().toLocaleLowerCase()

  useEffect(() => {
    const element = dialog.current
    const previousFocus = document.activeElement
    const overflow = document.body.style.overflow
    element.showModal()
    input.current?.focus()
    document.body.style.overflow = 'hidden'
    return () => {
      element.close()
      document.body.style.overflow = overflow
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
    }
  }, [])

  async function confirm() {
    if (!matches || busy) return
    setBusy(true)
    setError('')
    try {
      await onConfirm(confirmation.trim())
      onClose()
    } catch (cause) {
      setError(cause.message)
      setBusy(false)
    }
  }
  function close() { if (!busy) onClose() }

  return <dialog ref={dialog} aria-labelledby="delete-account-title" aria-describedby="delete-account-description"
    onCancel={(event) => { event.preventDefault(); close() }}
    onClick={(event) => { if (event.target === dialog.current) close() }}
    className="m-auto max-h-[90dvh] w-[min(480px,94vw)] overflow-y-auto rounded-xl border border-line bg-white p-0 text-ink shadow-xl backdrop:bg-black/40">
    <div className="p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <span className="grid h-11 w-11 place-items-center rounded-lg bg-paper text-muted"><Icon name="trash" className="h-5 w-5" /></span>
      </div>
      <h2 id="delete-account-title" className="mt-5 text-xl font-semibold">Delete your account?</h2>
      <p id="delete-account-description" className="mt-2 text-sm leading-6 text-muted">This permanently deletes your account, saved resumes, portfolios, and related data. This action can’t be undone.</p>
      <label className="mt-5 block text-sm font-medium" htmlFor="delete-account-confirmation">Type <strong>{fullName}</strong> to confirm
        <input ref={input} id="delete-account-confirmation" autoComplete="off" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-line bg-white px-3 text-ink" />
      </label>
      {error && <p role="alert" className="mt-4 rounded-lg border border-line p-3 text-sm">{error}</p>}
    </div>
    <div className="flex flex-col-reverse gap-3 border-t border-line p-5 sm:flex-row sm:justify-end sm:px-8" style={{ backgroundColor: 'var(--app-surface)' }}>
      <button type="button" disabled={busy} onClick={close} className="button button-outline disabled:opacity-50">Cancel</button>
      <button type="button" disabled={!matches || busy} onClick={confirm} className="button button-dark disabled:opacity-50"><Icon name="trash" className="h-4 w-4" />{busy ? 'Deleting…' : 'Delete account'}</button>
    </div>
  </dialog>
}
