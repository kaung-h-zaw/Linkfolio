import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import Icon from '../components/Icon'
import { api } from '../services/api'
export default function PasswordPage({ reset = false }) {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [visible, setVisible] = useState({})
  const [directReset, setDirectReset] = useState(import.meta.env.DEV && !reset)
  const [email, setEmail] = useState('')
  const [passwords, setPasswords] = useState({ password: '', confirmPassword: '' })
  const redirectTimer = useRef(null)
  const localDirectReset = import.meta.env.DEV && !reset && directReset
  useEffect(() => () => window.clearTimeout(redirectTimer.current), [])
  async function submit(event) {
    event.preventDefault()
    if (busy) return
    window.clearTimeout(redirectTimer.current)
    const fields = Object.fromEntries(new FormData(event.currentTarget))
    if (!reset && !localDirectReset) setEmail(fields.email)
    if ((reset || localDirectReset) && fields.password !== fields.confirmPassword) {
      setError('Your passwords don’t match.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const response = await api(localDirectReset ? '/auth/dev-reset-password' : `/auth/${reset ? 'reset-password' : 'forgot-password'}`, {
          method: 'POST',
          body: reset ? { token: params.get('token'), password: fields.password } : localDirectReset ? { email: fields.email, password: fields.password } : fields,
        })
      setResult(response)
      if (reset || localDirectReset) redirectTimer.current = window.setTimeout(() => navigate('/', { replace: true }), 1600)
    } catch (e) {
      window.clearTimeout(redirectTimer.current)
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <AuthLayout titleId={reset ? 'reset-password-title' : 'password-title'}>
      <span className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-paper text-accent"><Icon name="lock" className="h-5 w-5" /></span>
      <h1 id={reset ? 'reset-password-title' : 'password-title'} tabIndex={-1} className="text-3xl font-semibold tracking-tight">
        {reset || localDirectReset ? 'Choose a new password' : 'Reset your password'}
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted">{reset || localDirectReset ? 'Create a new password with at least 8 characters to secure your account.' : 'Enter your account email and we’ll send you a secure link to choose a new password.'}</p>
      {import.meta.env.DEV && !reset && <div className="mt-5 flex rounded-lg border border-line bg-paper p-1" aria-label="Password reset method">
        <button type="button" aria-pressed={!directReset} onClick={() => { setDirectReset(false); setResult(null); setError('') }} className={`flex-1 rounded-md px-3 py-2 text-sm ${!directReset ? 'bg-white font-medium text-ink shadow-sm' : 'text-muted'}`}>Email link</button>
        <button type="button" aria-pressed={directReset} onClick={() => { setDirectReset(true); setResult(null); setError('') }} className={`flex-1 rounded-md px-3 py-2 text-sm ${directReset ? 'bg-white font-medium text-ink shadow-sm' : 'text-muted'}`}>No email (local)</button>
      </div>}
      <form onSubmit={submit} className="mt-6 space-y-4">
        {reset || localDirectReset ? (
          <>
            {localDirectReset && <label className="block text-sm">Account email<input name="email" type="email" required autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" className="mt-2 min-h-12 w-full rounded border border-line px-3" /></label>}
            <label className="block text-sm">
              New password
              <span className="relative mt-2 block">
                <input name="password" type={visible.password ? 'text' : 'password'} required minLength={8} maxLength={256} autoComplete="new-password" placeholder="At least 8 characters" value={passwords.password} onChange={event => setPasswords(value => ({ ...value, password: event.target.value }))} className="min-h-12 w-full rounded border border-line px-3 pr-12" />
                <button type="button" aria-label={`${visible.password ? 'Hide' : 'Show'} new password`} onClick={() => setVisible(value => ({ ...value, password: !value.password }))} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted hover:text-accent"><Icon name={visible.password ? 'hidden' : 'eye'} className="h-4 w-4" /></button>
              </span>
            </label>
            <label className="block text-sm">
              Confirm password
              <span className="relative mt-2 block">
                <input name="confirmPassword" type={visible.confirmPassword ? 'text' : 'password'} required minLength={8} maxLength={256} autoComplete="new-password" placeholder="Enter the password again" value={passwords.confirmPassword} onChange={event => setPasswords(value => ({ ...value, confirmPassword: event.target.value }))} aria-invalid={Boolean(passwords.confirmPassword && passwords.password !== passwords.confirmPassword)} className="min-h-12 w-full rounded border border-line px-3 pr-12" />
                <button type="button" aria-label={`${visible.confirmPassword ? 'Hide' : 'Show'} confirmation password`} onClick={() => setVisible(value => ({ ...value, confirmPassword: !value.confirmPassword }))} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted hover:text-accent"><Icon name={visible.confirmPassword ? 'hidden' : 'eye'} className="h-4 w-4" /></button>
              </span>
              {passwords.confirmPassword && passwords.password !== passwords.confirmPassword && <span role="alert" className="mt-2 block text-xs text-red-700">Passwords don’t match.</span>}
            </label>
          </>
        ) : (
          <label className="block text-sm">
            Email
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="mt-2 min-h-12 w-full rounded border border-line px-3"
            />
          </label>
        )}
        <button disabled={busy || Boolean((reset || localDirectReset) && passwords.confirmPassword && passwords.password !== passwords.confirmPassword)} className="button button-green w-full disabled:opacity-50">
          {!busy && <Icon name="mail" className="h-4 w-4" />}
          {busy ? 'Please wait…' : reset || localDirectReset ? 'Update password' : 'Send reset link'}
        </button>
      </form>
      {error && (
        <p role="alert" className="mt-4 text-sm text-red-700">
          {error}
        </p>
      )}
      {result && (
        <p role="status" className="mt-4 text-sm">
          {result.message}
        </p>
      )}
      {result?.demoResetUrl && (
        <p className="mt-4 rounded-lg border border-line bg-paper p-3 text-sm leading-6 text-muted">
          Email delivery is off in this local setup. You can set a new password directly:{' '}
          <button type="button" className="font-medium text-accent underline underline-offset-2" onClick={() => { setDirectReset(true); setResult(null); setError('') }}>Open reset link</button>
        </p>
      )}
    </AuthLayout>
  )
}
