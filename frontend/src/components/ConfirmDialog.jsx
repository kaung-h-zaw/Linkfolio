import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'

export default function ConfirmDialog({ title, description, confirmLabel = 'Delete', busyLabel = 'Deleting…', icon = 'trash', onConfirm, onClose }) {
  const dialog = useRef(null)
  const cancelButton = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const element = dialog.current
    const previousFocus = document.activeElement
    const overflow = document.body.style.overflow
    element.showModal()
    cancelButton.current?.focus()
    document.body.style.overflow = 'hidden'
    return () => {
      element.close()
      document.body.style.overflow = overflow
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
    }
  }, [])

  async function confirm() {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      await onConfirm()
      onClose()
    } catch (cause) {
      setError(cause.message || 'The item could not be deleted. Please try again.')
      setBusy(false)
    }
  }
  function close() { if (!busy) onClose() }

  return <dialog ref={dialog} aria-labelledby="confirm-dialog-title" aria-describedby="confirm-dialog-description"
    onCancel={(event) => { event.preventDefault(); close() }}
    onClick={(event) => { if (event.target === dialog.current) close() }}
    className="m-auto max-h-[90dvh] w-[min(480px,94vw)] overflow-y-auto rounded-2xl border border-line bg-white p-0 text-ink shadow-xl backdrop:bg-black/50">
    <div className="p-6 sm:p-8">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-paper text-accent"><Icon name={icon} className="h-5 w-5" /></div>
      <h2 id="confirm-dialog-title" className="mt-5 text-xl font-semibold tracking-tight">{title}</h2>
      <p id="confirm-dialog-description" className="mt-2 text-sm leading-6 text-muted">{description}</p>
      {error && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    </div>
    <div className="flex flex-col-reverse gap-3 border-t border-line p-5 sm:flex-row sm:justify-end sm:px-8" style={{ backgroundColor: 'var(--app-surface)' }}>
      <button ref={cancelButton} type="button" disabled={busy} onClick={close} className="button button-outline disabled:opacity-50">Cancel</button>
      <button type="button" disabled={busy} onClick={confirm} className="button button-dark disabled:opacity-50"><Icon name={icon} className="h-4 w-4" />{busy ? busyLabel : confirmLabel}</button>
    </div>
  </dialog>
}
