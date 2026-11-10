import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/authContext'
import AuthLayout from '../components/AuthLayout'
import Icon from '../components/Icon'

const fields = [
  {
    name: 'fullName',
    label: 'Full Name',
    autoComplete: 'name',
    placeholder: 'Your full name',
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    autoComplete: 'email',
    placeholder: 'you@example.com',
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    autoComplete: 'new-password',
    placeholder: 'Create a password',
  },
  {
    name: 'confirmPassword',
    label: 'Confirm Password',
    type: 'password',
    autoComplete: 'new-password',
    placeholder: 'Enter your password again',
  },
]

function validate(values) {
  const errors = {}
  if (!values.fullName.trim()) errors.fullName = 'Enter your full name.'
  if (!values.email.trim()) errors.email = 'Enter your email address.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
    errors.email = 'Enter a valid email address, like you@example.com.'
  if (!values.password) errors.password = 'Create a password.'
  else if (values.password.length < 8)
    errors.password = 'Use at least 8 characters for your password.'
  if (!values.confirmPassword) errors.confirmPassword = 'Confirm your password.'
  else if (values.confirmPassword !== values.password)
    errors.confirmPassword = 'Your passwords don’t match.'
  return errors
}

export default function Register() {
  const navigate = useNavigate()
  const location = useLocation()
  const { authenticate } = useAuth()
  const [busy, setBusy] = useState(false)
  const [serverError, setServerError] = useState('')
  const [values, setValues] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [touched, setTouched] = useState({})
  const [visible, setVisible] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const errors = validate(values)

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
      await authenticate('/auth/register', values)
      const destination = location.state?.from
      navigate(
        destination?.startsWith('/') && !destination.startsWith('//') ? destination : '/setup',
        { replace: true },
      )
    } catch (error) {
      setServerError(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout titleId="register-title">
      <h1 id="register-title" tabIndex={-1} className="text-3xl font-semibold tracking-tight">
        Create your account
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted">Enter your details to get started.</p>
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
          const hintId = field.name === 'password' ? 'password-hint' : undefined
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
                  autoCapitalize={field.name === 'fullName' ? 'words' : 'none'}
                  spellCheck={false}
                  required
                  minLength={isPassword ? 8 : undefined}
                  placeholder={field.placeholder}
                  value={values[field.name]}
                  aria-invalid={Boolean(error)}
                  aria-describedby={
                    [hintId, error ? errorId : undefined].filter(Boolean).join(' ') || undefined
                  }
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
                    className="absolute inset-y-1 right-1 min-w-16 rounded px-3 text-xs font-semibold text-accent hover:bg-sage/60"
                  >
                    {visible[field.name] ? 'Hide' : 'Show'}
                  </button>
                )}
              </div>
              {hintId && (
                <p id={hintId} className="mt-2 text-xs text-muted">
                  Use at least 8 characters.
                </p>
              )}
              {error && (
                <p id={errorId} className="mt-2 text-xs leading-5 text-red-700" aria-live="polite">
                  {error}
                </p>
              )}
            </div>
          )
        })}
        <button
          type="submit"
          disabled={busy}
          className="button button-green w-full disabled:opacity-50"
        >
          {busy ? 'Creating account…' : 'Create account'} <Icon name="arrow" className="h-4 w-4" />
        </button>
      </form>

      <p className="mt-6 border-t border-line pt-6 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-accent underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
