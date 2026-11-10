import { startTransition, useEffect, useRef, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthContext, useAuth } from '../lib/authContext'
import MessagesProvider from './MessagesProvider'
import { api } from '../lib/api'
import { clearResumes, loadResumes } from '../lib/resumeStorage'

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [templates, setTemplates] = useState([])
  const epoch = useRef(0)
  async function refreshTemplates() {
    const result = await api('/templates')
    setTemplates(result.templates)
  }
  useEffect(() => {
    let active = true
    api('/templates')
      .then((result) => {
        if (active) setTemplates(result.templates)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])
  useEffect(() => {
    let active = true
    const current = epoch.current
    async function restore() {
      try {
        const result = await api('/auth/me')
        if (!active || current !== epoch.current) return
        await loadResumes()
        if (active && current === epoch.current) {
          setUser(result.user)
          setError('')
        }
      } catch (e) {
        if (active && current === epoch.current) {
          clearResumes()
          setUser(null)
          setError(e.status === 401 ? '' : e.message)
        }
      } finally {
        if (active && current === epoch.current) setLoading(false)
      }
    }
    restore()
    return () => {
      active = false
    }
  }, [attempt])
  async function authenticate(path, values) {
    epoch.current++
    try {
      const result = await api(path, { method: 'POST', body: values })
      clearResumes()
      await Promise.all([loadResumes(), refreshTemplates()])
      setUser(result.user)
      setError('')
      return result.user
    } finally {
      setLoading(false)
    }
  }
  async function logout() {
    await api('/auth/logout', { method: 'POST' })
    clearResumes()
    epoch.current++
    startTransition(() => {
      navigate('/', { replace: true })
      setUser(null)
    })
  }
  function retry() {
    setLoading(true)
    setAttempt((n) => n + 1)
  }
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        retry,
        authenticate,
        logout,
        setUser,
        templates,
        refreshTemplates,
      }}
    >
      {user ? <MessagesProvider key={user.id}>{children}</MessagesProvider> : children}
    </AuthContext.Provider>
  )
}
export function RequireAuth({ children, admin = false }) {
  const { user, loading, error, retry } = useAuth()
  const location = useLocation()
  if (loading)
    return (
      <main className="p-8" role="status">
        Loading your workspace…
      </main>
    )
  if (error)
    return (
      <main className="mx-auto max-w-xl p-8">
        <h1 className="text-2xl font-semibold">Workspace unavailable</h1>
        <p role="alert" className="my-4">
          {error}
        </p>
        <button onClick={retry} className="button button-green">
          Try again
        </button>
      </main>
    )
  if (!user)
    return <Navigate replace to="/login" state={{ from: location.pathname + location.search }} />
  if (admin && user.role !== 'admin')
    return (
      <main className="p-8">
        <h1 className="text-2xl font-semibold">Administrator access required</h1>
      </main>
    )
  return children
}
