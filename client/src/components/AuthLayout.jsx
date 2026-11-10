import { Link } from 'react-router-dom'
import { Logo } from './Navbar'

export default function AuthLayout({ children, titleId }) {
  return (
    <div className="app-auth flex min-h-svh flex-col bg-white">
      <a href="#auth-content" className="skip-link">
        Skip to form
      </a>
      <header className="border-b border-line">
        <div className="shell flex h-18 items-center justify-between gap-4">
          <Logo />
          <Link to="/" className="nav-link text-sm">
            Back to home
          </Link>
        </div>
      </header>
      <main
        id="auth-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-[440px] flex-1 px-6 py-10 sm:py-14"
      >
        <section aria-labelledby={titleId}>{children}</section>
      </main>
      <footer className="py-6 text-center text-sm text-muted">
        © {new Date().getFullYear()} Linkfolio
      </footer>
    </div>
  )
}
