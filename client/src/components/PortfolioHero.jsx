import { resolvePortfolioPortrait } from '../lib/portfolioImages'
import Icon from './Icon'
import CopyEmailButton from './CopyEmailButton'
import ResumeDownloadButton from './ResumeDownloadButton'
import { portfolioDisplayName } from '../lib/portfolioIdentity'

// Original Linkfolio composition; all themes consume the same personal content.
export default function PortfolioHero({ personal, resumeProfile, settings, layout, projects, email, target }) {
  const portrait = resolvePortfolioPortrait(settings,personal)
  const headline = settings.headline || personal.headline || 'My work and experience'
  return <header id={target('hero').slice(1)} data-section="hero" className="portfolio-hero portfolio-source-hero" data-layout={layout} data-photo={portrait ? 'on' : 'off'} data-cover="off">
    <div className="portfolio-hero-copy" data-layout={layout}>
      <p className="portfolio-owner">{portfolioDisplayName(personal.fullName)}</p>
      {settings.availability && <p className="portfolio-availability">{settings.availability}</p>}
      <h1>{headline.split(/(\S+-\S+)/).map((part,index) => part.includes('-') && part.length <= 14 ? <span key={index} className="portfolio-headline-word">{part}</span> : part)}</h1>
      {personal.location && <p className="portfolio-location mt-4 text-sm text-muted">{personal.location}</p>}
      {settings.contact !== false && email && <div className="portfolio-hero-email"><CopyEmailButton email={email} variant="text" /></div>}
      <div className="portfolio-hero-actions mt-7 flex flex-wrap gap-3">
        {settings.projects !== false && projects.length > 0 && <a className="portfolio-button" href={target('projects')}>View my work <Icon name="arrow" className="h-4 w-4" /></a>}
        {settings.resumeDownload && <ResumeDownloadButton profile={resumeProfile} className="portfolio-hero-download" />}
      </div>
    </div>
    {portrait && <figure className="portfolio-portrait-frame"><img className="portfolio-portrait" src={portrait} alt={`Portrait of ${personal.fullName || 'me'}`} /></figure>}
  </header>
}
