import PortfolioPage from './views/PortfolioPage'
import { useEffect, useRef } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import Home from './views/Home'
import Register from './views/Register'
import Login from './views/Login'
import AdminPage from './views/AdminPage'
import EditorPage from './views/EditorPage'
import SetupPage from './views/SetupPage'
import Placeholder from './views/Placeholder'
import WorkspacePage from './views/WorkspacePage'
import PublicPortfolioPage from './views/PublicPortfolioPage'
import PasswordPage from './views/PasswordPage'
import { AuthProvider, RequireAuth } from './controllers/AuthController'

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
    const popupPaths = ['/login','/register','/forgot-password','/reset-password']
    if (previousPath.current !== pathname) {
      if (!popupPaths.includes(pathname) && !popupPaths.includes(previousPath.current)) window.scrollTo(0, 0)
      if (!popupPaths.includes(pathname) && !popupPaths.includes(previousPath.current)) document.querySelector('h1')?.focus({ preventScroll: true })
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
        <AppRoutes />
        </AppSurface>
      </AuthProvider>
    </BrowserRouter>
  )
}

function AppRoutes() {
  const location = useLocation()
  const authPopup = ['/login','/register','/forgot-password','/reset-password'].includes(location.pathname)
  const backgroundLocation = location.state?.backgroundLocation || (authPopup ? '/' : location)
  return <>
        <Routes location={authPopup ? backgroundLocation : location}>
          <Route path="/" element={<Home />} />
          <Route
            path="/setup"
            element={
              <RequireAuth userOnly>
                <SetupPage />
              </RequireAuth>
            }
          />
          <Route
            path="/resume/import"
            element={
              <RequireAuth userOnly>
                <SetupPage importOpen />
              </RequireAuth>
            }
          />
          <Route
            path="/portfolio"
            element={
              <RequireAuth userOnly>
                <PortfolioPage />
              </RequireAuth>
            }
          />
          <Route
            path="/portfolio/editor/*"
            element={
              <RequireAuth userOnly>
                <EditorPage mode="portfolio" />
              </RequireAuth>
            }
          />
          <Route
            path="/editor"
            element={
              <RequireAuth userOnly>
                <EditorPage />
              </RequireAuth>
            }
          />
          <Route path="/p/:slug" element={<PublicPortfolioPage />} />
          <Route path="/p/:slug/:detailKind/:entryId" element={<PublicPortfolioPage />} />
          <Route path="/forgot-password" element={<PasswordPage />} />
          <Route path="/reset-password" element={<PasswordPage reset />} />
          <Route path="/admin" element={<RequireAuth admin><AdminPage /></RequireAuth>} />
          {['dashboard', 'analytics', 'messages', 'account', 'premium'].map((view) => (
            <Route
              key={view}
              path={`/${view}`}
              element={
                <RequireAuth userOnly>
                  <WorkspacePage key={view} view={view} />
                </RequireAuth>
              }
            />
          ))}
          <Route path="*" element={<Placeholder title="Page not found" />} />
        </Routes>
        {authPopup && <Routes location={location}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<PasswordPage />} />
          <Route path="/reset-password" element={<PasswordPage reset />} />
        </Routes>}
  </>
}
