import LogoMark from './LogoMark'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon'

export function Logo({ to = '/', label = 'Linkfolio home' }) {
  return (
    <Link
      to={to}
      aria-label={label}
      className="app-brand flex items-center gap-2.5 text-xl font-bold tracking-tight"
    >
      <LogoMark />
      Linkfolio
    </Link>
  )
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const toggle = useRef(null)
  const links = [
    ['Examples', '#demo'],
    ['How it works', '#how-it-works'],
    ['Pricing', '#pricing'],
  ]
  return (
    <header className="app-landing-navbar border-b border-line bg-white">
      <div className="shell flex h-18 items-center justify-between gap-5">
        <Logo />
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-8 whitespace-nowrap text-sm font-medium min-[1025px]:flex"
        >
          {links.map(([label, href]) => (
            <a key={href} href={href} className="nav-link">
              {label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-6 whitespace-nowrap min-[1025px]:flex">
          <Link className="home-signin-button nav-link text-sm font-medium" to="/login">
            Sign in
          </Link>
          <Link
            className="button button-dark !min-h-10 !px-5 !text-sm"
            to="/register"
          >
            Get started <Icon name="arrow" className="h-4 w-4" />
          </Link>
        </div>

        <button
          ref={toggle}
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-md border border-line min-[1025px]:hidden"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(!open)}
        >
          <Icon name={open ? 'close' : 'menu'} />
        </button>
      </div>
      {open && (
        <nav
          id="mobile-menu"
          aria-label="Mobile navigation"
          className="shell flex flex-col gap-1 border-t border-line py-4 min-[1025px]:hidden"
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setOpen(false)
              toggle.current?.focus()
            }
          }}
        >
          {links.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="nav-link py-3"
              onClick={() => setOpen(false)}
            >
              {label}
            </a>
          ))}
          <Link to="/login" className="py-3" onClick={() => setOpen(false)}>
            Sign in
          </Link>
          <Link
            to="/register"
            className="button button-dark mt-2"
            onClick={() => setOpen(false)}
          >
            Get started <Icon name="arrow" />
          </Link>
        </nav>
      )}
    </header>
  )
}
