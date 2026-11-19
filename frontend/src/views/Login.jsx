import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/authContext'
import AuthLayout from '../components/AuthLayout'
import Icon from '../components/Icon'

const fields = [
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    autoComplete: 'username',
    placeholder: 'you@example.com',
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    autoComplete: 'current-password',
    placeholder: 'Enter your password',
  },
]

function validate(values) {
  const errors = {}
  if (!values.email.trim()) errors.email = 'Enter your email address.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
    errors.email = 'Enter a valid email address, like you@example.com.'
  if (!values.password) errors.password = 'Enter your password.'
  return errors
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { authenticate, user, loading } = useAuth()
  const [busy, setBusy] = useState(false)
  const [serverError, setServerError] = useState('')
  const [values, setValues] = useState({
    email: '',
    password: '',
  })
  const [touched, setTouched] = useState({})
  const [visible, setVisible] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const errors = validate(values)

  if (loading) return <main className="p-8" role="status">Checking your session…</main>
  if (user) return <Navigate replace to={user.role === 'admin' ? '/admin' : '/setup'} />

  async function handleSubmit(event) {
    if (busy) {
      event.preventDefault()
      return
    }
    event.preventDefault()
    setSubmitted(true)
    const firstInvalid = fields.find((field) => errors[field.name])
    if (firstInvalid) {
      event.currentTarget.elements.namedItem(firstInvalid.name)?.focus()
      return
    }
    setBusy(true)
    setServerError('')
    try {
      const signedInUser = await authenticate('/auth/login', values)
      const destination = location.state?.from
      navigate(
        destination?.startsWith('/') && !destination.startsWith('//')
          ? destination
          : signedInUser.role === 'admin' ? '/admin' : '/setup',
        { replace: true },
      )
    } catch (error) {
      setServerError(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout titleId="login-title">
      <h1 id="login-title" tabIndex={-1} className="text-3xl font-semibold tracking-tight">
        Sign in
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        Enter your email and password to continue.
      </p>
      <form noValidate onSubmit={handleSubmit} className="mt-7 space-y-4">
        {serverError && (
          <p
            role="alert"
            className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {serverError}
          </p>
        )}
        {fields.map((field) => {
          const error = touched[field.name] || submitted ? errors[field.name] : undefined
          const isPassword = field.type === 'password'
          const errorId = `${field.name}-error`
          return (
            <div key={field.name}>
              <label htmlFor={field.name} className="mb-2 block text-sm font-medium">
                {field.label}
              </label>
              <div className="relative">
                <input
                  id={field.name}
                  name={field.name}
                  type={
                    isPassword ? (visible[field.name] ? 'text' : 'password') : field.type || 'text'
                  }
                  autoComplete={field.autoComplete}
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  placeholder={field.placeholder}
                  value={values[field.name]}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? errorId : undefined}
                  onChange={(event) => {
                    setValues({
                      ...values,
                      [field.name]: event.target.value,
                    })
                  }}
                  onBlur={() => setTouched({ ...touched, [field.name]: true })}
                  className={`min-h-12 w-full rounded-md border bg-white px-3 py-3 text-base placeholder:text-muted/80 focus:border-accent ${isPassword ? 'pr-20' : ''} ${error ? 'border-red-700' : 'border-line'}`}
                />
                {isPassword && (
                  <button
                    type="button"
                    aria-label={`${visible[field.name] ? 'Hide' : 'Show'} ${field.label.toLowerCase()}`}
                    aria-controls={field.name}
                    onClick={() =>
                      setVisible({
                        ...visible,
                        [field.name]: !visible[field.name],
                      })
                    }
                    className="absolute inset-y-1 right-1 flex min-w-10 items-center justify-center rounded px-2 text-accent hover:bg-sage/60"
                  >
                    <Icon name={visible[field.name] ? 'hidden' : 'eye'} className="h-4 w-4" />
                  </button>
                )}
              </div>
              {error && (
                <p id={errorId} className="mt-2 text-xs leading-5 text-red-700" aria-live="polite">
                  {error}
                </p>
              )}
            </div>
          )
        })}
        <Link to="/forgot-password" className="block py-2 text-right text-sm text-accent underline">
          Forgot password?
        </Link>
        <button
          type="submit"
          disabled={busy}
          className="button button-green w-full disabled:opacity-50"
        >
          {busy ? 'Signing in…' : 'Sign In'} <Icon name="arrow" className="h-4 w-4" />
        </button>
      </form>

      <p className="mt-6 border-t border-line pt-6 text-center text-sm text-muted">
        New to Linkfolio?{' '}
        <Link to="/register" state={location.state} className="font-semibold text-accent underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  )
}
