import { useEffect, useRef, useState } from 'react'
import Icon from '../Icon'

export default function UnsavedChangesDialog({ onSaveAndLeave, onLeave, onClose }) {
  const dialog = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    const element = dialog.current
    const previousFocus = document.activeElement
    element.showModal()
    return () => {
      element.close()
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
    }
  }, [])
  async function saveAndLeave() {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      await onSaveAndLeave()
    } catch (error) {
      setError(`Could not save: ${error.message}`)
      setBusy(false)
    }
  }
  return <dialog ref={dialog} aria-labelledby="unsaved-changes-title"
    onCancel={(event) => { event.preventDefault(); if (!busy) onClose() }}
    className="unsaved-changes-dialog fixed m-auto max-h-[90dvh] w-[min(380px,calc(100%_-_2rem))] overflow-y-auto rounded-2xl border border-line bg-white p-6 text-ink shadow-xl backdrop:bg-black/30">
    <button autoFocus type="button" disabled={busy} onClick={onClose} aria-label="Close save prompt" title="Keep editing" className="unsaved-close absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-paper disabled:opacity-50"><Icon name="close" className="h-4 w-4" /></button>
    <div className="flex items-center gap-3 pr-6">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sage text-accent"><Icon name="save" className="h-5 w-5" /></span>
      <h2 id="unsaved-changes-title" className="text-xl font-bold">Save changes?</h2>
    </div>
    {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
    <div className="mt-6 grid grid-cols-2 gap-3">
      <button type="button" disabled={busy} onClick={onLeave} className="button button-outline flex items-center justify-center gap-2 disabled:opacity-50"><Icon name="saveOff" className="h-4 w-4 shrink-0" />Don’t save</button>
      <button type="button" disabled={busy} onClick={saveAndLeave} className="button button-green flex items-center justify-center gap-2 disabled:opacity-50"><Icon name="save" className="h-4 w-4 shrink-0" />{busy ? 'Saving…' : 'Save & leave'}</button>
    </div>
  </dialog>
}
