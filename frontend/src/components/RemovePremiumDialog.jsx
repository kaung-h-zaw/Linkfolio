import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'

export default function RemovePremiumDialog({ onConfirm, onClose }) {
  const dialog = useRef(null)
  const keepButton = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    const element = dialog.current
    const previousFocus = document.activeElement
    const overflow = document.body.style.overflow
    element.showModal()
    keepButton.current.focus()
    document.body.style.overflow = 'hidden'
    return () => {
      element.close()
      document.body.style.overflow = overflow
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
      else document.querySelector('main h1')?.focus({ preventScroll: true })
    }
  }, [])
  async function confirm() {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      setError(error.message)
      setBusy(false)
    }
  }
  function close() { if (!busy) onClose() }
  return (
    <dialog ref={dialog} aria-labelledby="remove-premium-title" aria-describedby="remove-premium-description"
      onCancel={(event) => { event.preventDefault(); close() }}
      onClick={(event) => { if (event.target === dialog.current) close() }}
      className="m-auto max-h-[90dvh] w-[min(480px,94vw)] overflow-y-auto rounded-2xl border border-line bg-white p-0 text-ink shadow-xl backdrop:bg-black/40">
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-paper text-accent"><Icon name="spark" className="h-6 w-6" /></span>
          <button type="button" aria-label="Close plan confirmation" disabled={busy} onClick={close} className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-white text-muted hover:bg-paper disabled:opacity-50"><Icon name="close" className="h-5 w-5" /></button>
        </div>
        <h2 id="remove-premium-title" className="mt-5 text-2xl font-semibold tracking-tight">Switch to Free?</h2>
        <p id="remove-premium-description" className="mt-3 text-base leading-7 text-muted">You’ll remove Premium access from your account. Here’s what changes.</p>
        <div className="mt-6 space-y-5">
          <div className="flex items-start gap-3"><Icon name="check" className="mt-1 h-5 w-5 shrink-0 text-accent" /><div><p className="text-sm font-semibold">Your saved work stays</p><p className="mt-1 text-sm leading-6 text-muted">Your resumes and portfolios won’t be deleted.</p></div></div>
          <div className="flex items-start gap-3"><Icon name="window" className="mt-1 h-5 w-5 shrink-0 text-muted" /><div><p className="text-sm font-semibold">Free plan limits apply</p><p className="mt-1 text-sm leading-6 text-muted">New documents and template choices follow the Free plan.</p></div></div>
        </div>
        {error && <p role="alert" className="mt-5 rounded-lg border border-red-200 p-3 text-sm leading-6 text-red-700">{error}</p>}
      </div>
      <div className="flex flex-col gap-3 border-t border-line p-6 sm:flex-row sm:px-8" style={{ backgroundColor: 'var(--app-surface)' }}>
        <button ref={keepButton} type="button" disabled={busy} onClick={close} className="button button-green flex-1 disabled:opacity-50">Keep Premium</button>
        <button type="button" disabled={busy} onClick={confirm} className="button button-outline flex-1 disabled:opacity-50">{busy ? 'Switching…' : 'Switch to Free'}</button>
      </div>
    </dialog>
  )
}
