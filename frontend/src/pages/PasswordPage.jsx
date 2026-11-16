import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { api } from '../lib/api'
export default function PasswordPage({ reset = false }) {
  const [params] = useSearchParams()
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  async function submit(event) {
    event.preventDefault()
    if (busy) return
    const fields = Object.fromEntries(new FormData(event.currentTarget))
    if (reset && fields.password !== fields.confirmPassword) {
      setError('Your passwords don’t match.')
      return
    }
    setBusy(true)
    setError('')
    try {
      setResult(
        await api(`/auth/${reset ? 'reset-password' : 'forgot-password'}`, {
          method: 'POST',
          body: reset ? { token: params.get('token'), password: fields.password } : fields,
        }),
      )
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <AuthLayout titleId="password-title">
      <h1 id="password-title" className="text-3xl font-semibold">
        {reset ? 'Choose a new password' : 'Reset your password'}
      </h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        {reset ? (
          <>
            <label className="block text-sm">
              New password
              <input
                name="password"
                type="password"
                required
                minLength={8}
                maxLength={256}
                autoComplete="new-password"
                className="mt-2 min-h-12 w-full rounded border border-line px-3"
              />
            </label>
            <label className="block text-sm">
              Confirm password
              <input
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                maxLength={256}
                autoComplete="new-password"
                className="mt-2 min-h-12 w-full rounded border border-line px-3"
              />
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
              className="mt-2 min-h-12 w-full rounded border border-line px-3"
            />
          </label>
        )}
        <button disabled={busy} className="button button-green w-full disabled:opacity-50">
          {busy ? 'Please wait…' : reset ? 'Update password' : 'Send reset link'}
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
        <p className="mt-4 rounded border border-amber-200 bg-amber-50 p-3 text-sm">
          Local demo: email delivery is not configured.{' '}
          <Link
            className="text-accent underline"
            to={new URL(result.demoResetUrl).pathname + new URL(result.demoResetUrl).search}
          >
            Open reset link
          </Link>
        </p>
      )}
      <Link to="/login" className="mt-6 block text-sm text-accent underline">
        Back to sign in
      </Link>
    </AuthLayout>
  )
}
