import { useEffect, useId, useState } from 'react'
import Icon from './Icon'

export default function CopyEmailButton({ email, variant = 'button' }) {
  const [copied, setCopied] = useState(0)
  const tooltipId = useId()
  const [error, setError] = useState(false)
  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(0), 2500)
    return () => clearTimeout(timer)
  }, [copied])
  async function copy() {
    try {
      await navigator.clipboard.writeText(email)
      setError(false)
      setCopied(value => value + 1)
    } catch {
      setError(true)
    }
  }
  return <span className={`portfolio-email-copy portfolio-email-copy--${variant}`}>
    <button type="button" className={`portfolio-email-button ${variant === 'text' ? 'portfolio-email-button--text' : 'portfolio-contact-link'}`} aria-describedby={copied ? tooltipId : undefined} aria-label={`Copy email address ${email}`} onClick={copy}>
      {variant !== 'text' && <Icon name="mail" className="h-4 w-4" />}
      <span className="portfolio-email-address">{email}</span>
      {variant !== 'text' && <><Icon name="copy" className="h-4 w-4" /><span className="portfolio-email-copy-label">Copy</span></>}
    </button>
    {copied > 0 && <span id={tooltipId} role="tooltip" className="portfolio-email-tooltip"><Icon name="check" className="h-3 w-3" />Copied</span>}
    <span role="status" className="sr-only">{copied ? 'Email address copied.' : ''}</span>
    {error && <span role="alert" className="mt-2 block text-xs">Could not copy. Select and copy the email address.</span>}
  </span>
}
