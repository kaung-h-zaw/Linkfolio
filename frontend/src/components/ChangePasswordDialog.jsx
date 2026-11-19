import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import { api } from '../lib/api'

export default function ChangePasswordDialog({ onClose }) {
  const dialog = useRef(null)
  const currentInput = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [visible, setVisible] = useState({})
  const [passwords, setPasswords] = useState({ password: '', confirmPassword: '' })

  useEffect(() => {
    const element = dialog.current
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    element.showModal()
    currentInput.current?.focus()
    document.body.style.overflow = 'hidden'
    return () => {
      element.close()
      document.body.style.overflow = previousOverflow
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
    }
  }, [])

  async function submit(event) {
    event.preventDefault()
    if (busy || done) return
    const fields = Object.fromEntries(new FormData(event.currentTarget))
    if (fields.password !== fields.confirmPassword) {
      setError('The new passwords do not match.')
      return
    }
    if (fields.currentPassword === fields.password) {
      setError('Choose a password different from your current one.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await api('/auth/change-password', {
        method: 'POST',
        body: { currentPassword: fields.currentPassword, password: fields.password },
      })
      setDone(true)
    } catch (cause) {
      setError(cause.message)
    } finally {
      setBusy(false)
    }
  }
  function close() { if (!busy) onClose() }

  return <dialog ref={dialog} aria-labelledby="change-password-title" aria-describedby="change-password-description"
    onCancel={event => { event.preventDefault(); close() }}
    onClick={event => { if (event.target === dialog.current) close() }}
    className="m-auto max-h-[90dvh] w-[min(480px,94vw)] overflow-y-auto rounded-2xl border border-line bg-white p-0 text-ink shadow-xl backdrop:bg-black/50">
    <form onSubmit={submit}>
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-paper text-accent"><Icon name="lock" className="h-5 w-5" /></span>
          <button type="button" aria-label="Close change password" disabled={busy} onClick={close} className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted hover:bg-paper disabled:opacity-50"><Icon name="close" className="h-4 w-4" /></button>
        </div>
        <h2 id="change-password-title" className="mt-5 text-2xl font-semibold tracking-tight">Change your password</h2>
        <p id="change-password-description" className="mt-2 text-sm leading-6 text-muted">Verify your current password, then choose a new one.</p>
        {done ? <p role="status" className="mt-5 rounded-lg border border-line bg-paper p-4 text-sm text-ink">Your password has been changed. You can keep using Linkfolio with your new password.</p> : <div className="mt-6 space-y-4">
          <label className="block text-sm font-medium">Current password<span className="relative mt-2 block"><input ref={currentInput} name="currentPassword" type={visible.current ? 'text' : 'password'} required autoComplete="current-password" className="min-h-12 w-full rounded-lg border border-line px-3 pr-12" /><button type="button" aria-label={`${visible.current ? 'Hide' : 'Show'} current password`} onClick={() => setVisible(value => ({ ...value, current: !value.current }))} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted hover:text-accent"><Icon name={visible.current ? 'hidden' : 'eye'} className="h-4 w-4" /></button></span></label>
          <label className="block text-sm font-medium">New password<span className="relative mt-2 block"><input name="password" type={visible.password ? 'text' : 'password'} required minLength={8} maxLength={256} autoComplete="new-password" value={passwords.password} onChange={event => setPasswords(value => ({ ...value, password: event.target.value }))} className="min-h-12 w-full rounded-lg border border-line px-3 pr-12" /><button type="button" aria-label={`${visible.password ? 'Hide' : 'Show'} new password`} onClick={() => setVisible(value => ({ ...value, password: !value.password }))} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted hover:text-accent"><Icon name={visible.password ? 'hidden' : 'eye'} className="h-4 w-4" /></button></span><span className="mt-1 block text-xs text-muted">Use at least 8 characters.</span></label>
          <label className="block text-sm font-medium">Confirm new password<span className="relative mt-2 block"><input name="confirmPassword" type={visible.confirmPassword ? 'text' : 'password'} required minLength={8} maxLength={256} autoComplete="new-password" value={passwords.confirmPassword} onChange={event => setPasswords(value => ({ ...value, confirmPassword: event.target.value }))} aria-invalid={Boolean(passwords.confirmPassword && passwords.password !== passwords.confirmPassword)} className="min-h-12 w-full rounded-lg border border-line px-3 pr-12" /><button type="button" aria-label={`${visible.confirmPassword ? 'Hide' : 'Show'} confirmation password`} onClick={() => setVisible(value => ({ ...value, confirmPassword: !value.confirmPassword }))} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted hover:text-accent"><Icon name={visible.confirmPassword ? 'hidden' : 'eye'} className="h-4 w-4" /></button></span>{passwords.confirmPassword && passwords.password !== passwords.confirmPassword && <span role="alert" className="mt-2 block text-xs text-red-700">Passwords don’t match.</span>}</label>
        </div>}
        {error && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      </div>
      <div className="flex flex-col-reverse gap-3 border-t border-line p-5 sm:flex-row sm:justify-end sm:px-8" style={{ backgroundColor: 'var(--app-surface)' }}>
        <button type="button" disabled={busy} onClick={close} className="button button-outline disabled:opacity-50">{done ? 'Close' : 'Cancel'}</button>
        {!done && <button type="submit" disabled={busy || Boolean(passwords.confirmPassword && passwords.password !== passwords.confirmPassword)} className="button button-green disabled:opacity-50"><Icon name={busy ? 'clock' : 'lock'} className="h-4 w-4" />{busy ? 'Updating…' : 'Update password'}</button>}
      </div>
    </form>
  </dialog>
}
