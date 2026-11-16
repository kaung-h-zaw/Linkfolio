import { useId, useRef, useState } from 'react'
import { useAuth } from '../lib/authContext'
import { Link } from 'react-router-dom'
import { Logo } from './Navbar'
import Icon from './Icon'
import { useMessages } from '../lib/messagesContext'

export default function SetupSidebar({ active, mobileCompact = true }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuId = useId()
  const menuToggle = useRef(null)
  const { user } = useAuth()
  const { unread = 0 } = useMessages() || {}
  return (
    <aside data-compact={mobileCompact ? 'true' : undefined} data-menu-open={menuOpen} className="app-sidebar border-b border-line bg-[#eef1f5] px-5 py-5 md:sticky md:top-0 md:flex md:h-dvh md:w-56 md:shrink-0 md:flex-col md:border-r md:border-b-0 md:px-5 md:py-8 lg:w-64">
      <div className="sidebar-brand-row"><Logo to="/dashboard" label="Linkfolio dashboard" /><div className="sidebar-brand-actions">{mobileCompact && <button ref={menuToggle} type="button" className="sidebar-menu-toggle" aria-label={menuOpen ? 'Close workspace menu' : 'Open workspace menu'} aria-expanded={menuOpen} aria-controls={menuId} onClick={() => setMenuOpen((open) => !open)}><Icon name={menuOpen ? 'close' : 'menu'} className="h-4 w-4" />Menu</button>}</div></div>
      <nav id={menuId} onKeyDown={(event) => { if (event.key === 'Escape') { setMenuOpen(false); menuToggle.current?.focus() } }} aria-label="Workspace" className="mt-6 flex flex-wrap gap-2 md:mt-12 md:flex-col">
        {[
          ['dashboard', 'Dashboard', 'window', '/dashboard'],
          ['resume', 'Resume', 'file', '/setup'],
          ['portfolio', 'Portfolio', 'window', '/setup?view=portfolio'],
          ['analytics', 'Analytics', 'eye', '/analytics'],
          ['messages', 'Messages', 'mail', '/messages'],
          ['account', 'Account', 'user', '/account'],
          ...(user?.plan !== 'premium' ? [['premium', 'Upgrade to Premium', 'spark', '/premium']] : []),
          ...(user?.role === 'admin' ? [['admin', 'Admin', 'user', '/admin']] : []),
        ].map(([id, label, icon, to]) => (
          <Link
            key={id}
            onClick={() => setMenuOpen(false)}
            to={to}
            aria-current={active === id ? 'page' : undefined}
            className={`flex min-h-11 flex-1 items-center gap-3 rounded-md px-4 text-sm font-medium md:flex-none ${active === id ? 'bg-white text-ink shadow-sm' : 'text-muted hover:bg-white/60'}`}
          >
            <Icon name={icon} className="h-4 w-4" />
            {label}
            {id === 'messages' && unread > 0 && <span aria-label={`${unread} unread messages`} className="ml-auto rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-white">{unread > 99 ? '99+' : unread}</span>}
          </Link>
        ))}
      </nav>
      <div className="app-sidebar-account mt-5 border-t border-slate-200 pt-4 text-sm">
        <p className="truncate font-semibold">{user?.fullName}</p>
        <p className="mt-1 text-xs text-muted">
          {user?.plan === 'premium' ? 'Premium' : 'Free'} account
        </p>
        <Link to="/account" className="mt-3 inline-block min-h-10 py-2 text-sm text-accent">Account settings</Link>
      </div>
    </aside>
  )
}
