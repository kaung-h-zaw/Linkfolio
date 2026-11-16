import { Link } from 'react-router-dom'
import { Logo } from './Navbar'
import Icon from './Icon'
import AuthDialog from './AuthDialog'
import './publicPages.css'

export default function AuthLayout({ children, titleId }) {
  if (titleId === 'login-title' || titleId === 'register-title') return <AuthDialog titleId={titleId}>{children}</AuthDialog>
  return (
    <div className="app-auth flex min-h-svh flex-col bg-white">
      <a href="#auth-content" className="skip-link">
        Skip to form
      </a>
      <header className="auth-navigation">
        <div className="shell flex h-18 items-center justify-between gap-4">
          <Logo />
          <div className="auth-header-actions"><Link to="/" className="auth-home-button">
            <Icon name="home" className="h-4 w-4" />
            Home
          </Link></div>
        </div>
      </header>
      <main
        id="auth-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-[440px] flex-1 px-6 py-10 sm:py-14"
      >
        <aside className="auth-introduction" aria-label="About Linkfolio">
          <span className="public-eyebrow">YOUR NEXT CHAPTER</span>
          <h2>Your experience.<br />Ready to share.</h2>
          <p>A resume you’re proud of. A portfolio that brings your work to life. Keep them together in Linkfolio.</p>
          <div className="auth-benefits">
            {[["file", "Build your resume", "Choose a template and make it yours."], ["window", "Share your portfolio", "Give your work a place online."], ["download", "Take it with you", "Download your resume as a PDF."]].map(([icon,title,text]) => <div key={title}><span><Icon name={icon} className="h-5 w-5" /></span><div><h3>{title}</h3><p>{text}</p></div></div>)}
          </div>
          <span className="auth-introduction-note">One profile. More ways to tell your story.</span>
        </aside>
        <section className="auth-form-panel" aria-labelledby={titleId}>{children}</section>
      </main>
      <footer className="py-6 text-center text-sm text-muted">
        © {new Date().getFullYear()} Linkfolio
      </footer>
    </div>
  )
}
