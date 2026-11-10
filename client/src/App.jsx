import PortfolioPage from './pages/PortfolioPage'
import { useEffect, useRef } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'
import EditorPage from './pages/EditorPage'
import SetupPage from './pages/SetupPage'
import Placeholder from './pages/Placeholder'
import WorkspacePage from './pages/WorkspacePage'
import PublicPortfolioPage from './pages/PublicPortfolioPage'
import PasswordPage from './pages/PasswordPage'
import { AuthProvider, RequireAuth } from './components/AuthProvider'

function RouteUpdates() {
  const { pathname } = useLocation()
  const previousPath = useRef(pathname)
  useEffect(() => {
    const titles = {
      '/': 'Linkfolio — One profile. Your resume and portfolio.',
      '/setup': 'Your workspace — Linkfolio',
      '/resume/import': 'Import resume — Linkfolio',
      '/editor': 'Resume editor — Linkfolio',
      '/portfolio/editor': 'Portfolio editor — Linkfolio',
      '/portfolio/editor/design': 'Portfolio design — Linkfolio',
      '/portfolio/editor/share': 'Portfolio sharing — Linkfolio',
      '/portfolio': 'Portfolio preview — Linkfolio',
      '/login': 'Sign in — Linkfolio',
      '/register': 'Create your account — Linkfolio',
      '/dashboard': 'Your dashboard — Linkfolio',
      '/analytics': 'Portfolio analytics — Linkfolio',
      '/messages': 'Contact messages — Linkfolio',
      '/account': 'Your account — Linkfolio',
      '/premium': 'Your plan — Linkfolio',
      '/admin': 'Administration — Linkfolio',
      '/forgot-password': 'Reset password — Linkfolio',
      '/reset-password': 'Reset password — Linkfolio',
    }
    document.title =
      titles[pathname] ||
      (pathname.startsWith('/p/') ? 'Portfolio — Linkfolio' : 'Page not found — Linkfolio')
    if (previousPath.current !== pathname) {
      window.scrollTo(0, 0)
      document.querySelector('h1')?.focus({ preventScroll: true })
      previousPath.current = pathname
    }
  }, [pathname])
  return null
}
function AppSurface({ children }) {
  const { pathname } = useLocation()
  return <div className={pathname.startsWith('/p/') ? undefined : 'linkfolio-app'}>{children}</div>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RouteUpdates />
        <AppSurface>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/setup"
            element={
              <RequireAuth>
                <SetupPage />
              </RequireAuth>
            }
          />
          <Route
            path="/resume/import"
            element={
              <RequireAuth>
                <SetupPage importOpen />
              </RequireAuth>
            }
          />
          <Route
            path="/portfolio"
            element={
              <RequireAuth>
                <PortfolioPage />
              </RequireAuth>
            }
          />
          <Route
            path="/portfolio/editor/*"
            element={
              <RequireAuth>
                <EditorPage mode="portfolio" />
              </RequireAuth>
            }
          />
          <Route
            path="/editor"
            element={
              <RequireAuth>
                <EditorPage />
              </RequireAuth>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/p/:slug" element={<PublicPortfolioPage />} />
          <Route path="/p/:slug/:detailKind/:entryId" element={<PublicPortfolioPage />} />
          <Route path="/forgot-password" element={<PasswordPage />} />
          <Route path="/reset-password" element={<PasswordPage reset />} />
          {['dashboard', 'analytics', 'messages', 'account', 'premium', 'admin'].map((view) => (
            <Route
              key={view}
              path={`/${view}`}
              element={
                <RequireAuth admin={view === 'admin'}>
                  <WorkspacePage key={view} view={view} />
                </RequireAuth>
              }
            />
          ))}
          <Route path="*" element={<Placeholder title="Page not found" />} />
        </Routes>
        </AppSurface>
      </AuthProvider>
    </BrowserRouter>
  )
}
