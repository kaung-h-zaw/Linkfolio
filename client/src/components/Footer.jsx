import { Logo } from './Navbar'
export default function Footer() {
  return (
    <footer className="shell flex flex-wrap items-center justify-between gap-6 py-8">
      <Logo />
      <nav
        aria-label="Footer navigation"
        className="flex flex-wrap gap-5 text-sm text-muted"
      >
        <a href="#demo" className="nav-link">
          Examples
        </a>
        <a href="#how-it-works" className="nav-link">
          How it works
        </a>
      </nav>
      <p className="text-sm text-muted">
        © {new Date().getFullYear()} Linkfolio
      </p>
    </footer>
  )
}
