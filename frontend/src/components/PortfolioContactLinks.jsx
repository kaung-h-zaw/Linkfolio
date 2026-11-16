import { FiMail } from 'react-icons/fi'
import { contactLink } from '../lib/contactLinks'

export default function PortfolioContactLinks({ email, links }) {
  const items = links.map(contactLink).filter(Boolean)
  if (email) items.unshift({ id: 'contact-email', href: `mailto:${email}`, Glyph: FiMail, label: `Email: ${email}` })
  if (!items.length) return null
  return (
    <nav aria-label="Contact and social links" className="portfolio-social-links">
      {items.map(({ id, href, Glyph, label }) => (
        <a key={id} href={href} aria-label={label} title={label}
          target={href.startsWith('mailto:') ? undefined : '_blank'}
          rel={href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
          className="portfolio-social-link">
          <Glyph aria-hidden="true" focusable="false" />
        </a>
      ))}
    </nav>
  )
}
