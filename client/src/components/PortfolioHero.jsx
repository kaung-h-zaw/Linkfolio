import { resolvePortfolioPortrait } from '../lib/portfolioImages'
import Icon from './Icon'

// Original Linkfolio composition; all themes consume the same personal content.
export default function PortfolioHero({ personal, settings, layout, projects, email, target }) {
  const portrait = resolvePortfolioPortrait(settings,personal)
  return <header data-section="hero" className="portfolio-hero portfolio-source-hero" data-layout={layout} data-photo={portrait ? 'on' : 'off'} data-cover="off">
    <div className="portfolio-hero-copy" data-layout={layout}>
      <p className="portfolio-owner">{personal.fullName || 'Your name'}</p>
      {settings.availability && <p className="portfolio-availability">{settings.availability}</p>}
      <h1>{settings.headline || personal.headline || 'My work and experience'}</h1>
      {personal.location && <p className="portfolio-location mt-4 text-sm text-muted">{personal.location}</p>}
      <div className="portfolio-hero-actions mt-7 flex flex-wrap gap-3">
        {settings.projects !== false && projects.length > 0 && <a className="portfolio-button" href={target('projects')}>View my work <Icon name="arrow" className="h-4 w-4" /></a>}
        {settings.contact !== false && email && <a className="portfolio-contact-link" href={'mailto:' + email}>Get in touch</a>}
      </div>
    </div>
    {portrait && <figure className="portfolio-portrait-frame"><img className="portfolio-portrait" src={portrait} alt={`Portrait of ${personal.fullName || 'me'}`} /></figure>}
  </header>
}
