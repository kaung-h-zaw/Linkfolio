import { useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Logo } from './Navbar'
import Icon from './Icon'

export default function AuthDialog({ children, titleId }) {
  const dialog = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const close = () => navigate(location.state?.backgroundLocation || '/', { replace: true })

  useLayoutEffect(() => {
    const element = dialog.current
    const previousOverflow = document.body.style.overflow
    const previousFocus = document.activeElement
    document.body.style.overflow = 'hidden'
    element.showModal()
    element.querySelector('h1')?.focus({ preventScroll: true })
    return () => {
      element.close()
      document.body.style.overflow = previousOverflow
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
    }
  }, [])

  return <dialog ref={dialog} className="auth-popup" aria-labelledby={titleId}
    onCancel={event => { event.preventDefault(); close() }}>
    <header className="auth-popup-header">
      <Logo />
      <div className="flex items-center gap-3">
        <button type="button" onClick={close} aria-label="Close and return to home" title="Close (Escape)" className="auth-popup-close"><Icon name="close" className="h-5 w-5" /></button>
      </div>
    </header>
    <section className="auth-popup-content" aria-labelledby={titleId} tabIndex={0}>{children}</section>
  </dialog>
}
