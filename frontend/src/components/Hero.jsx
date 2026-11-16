import { Link } from 'react-router-dom'
import Icon from './Icon'

export default function Hero() {
  return (
    <section className="app-hero shell grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-2 lg:gap-16">
      <div>
        <span className="public-eyebrow">ONE PROFILE. YOUR NEXT OPPORTUNITY.</span>
        <h1
          tabIndex={-1}
          className="max-w-xl text-4xl font-semibold leading-[1.15] tracking-tight sm:text-5xl"
        >
          Your resume.
          <br />
          Your portfolio.
        </h1>
        <p className="mt-6 max-w-lg text-lg leading-8 text-muted">
          Add your details, choose a template, and share your work. No design or coding skills needed.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link to="/setup" className="button button-green">
            Create a resume
            <Icon name="arrow" className="h-4 w-4" />
          </Link>
          <a href="#demo" className="button button-outline">
            See an example
          </a>
        </div>
        <div className="home-hero-benefits"><span><Icon name="check" />PDF resume</span><span><Icon name="check" />Personal portfolio</span><span><Icon name="check" />No coding needed</span></div>
      </div>
      <div className="home-hero-preview overflow-hidden rounded-lg border border-line bg-white">
        <div className="flex items-center justify-between border-b border-line bg-paper px-5 py-3 text-sm">
          <span className="flex items-center gap-2 font-medium">
            <Icon name="file" className="h-4 w-4" />
            Your next chapter
          </span>
          <span className="home-preview-tag">Resume · Portfolio</span>
        </div>
        <div className="p-7 sm:p-9">
          <p className="text-2xl font-semibold">Alex Morgan</p>
          <p className="mt-1 text-base text-muted">Product Designer</p>
          <p className="mt-3 text-sm text-muted">
            Portland, OR · alex@example.com
          </p>
          <div className="mt-7 border-t border-line pt-5">
            <h2 className="text-sm font-semibold">Profile</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Product designer creating useful, accessible digital experiences.
            </p>
          </div>
          <div className="mt-5 border-t border-line pt-5">
            <h2 className="text-sm font-semibold">Experience</h2>
            <p className="mt-2 text-sm font-medium">
              Senior Product Designer · North Studio
            </p>
            <p className="mt-1 text-sm text-muted">2023 – Present</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Designed simpler workflows and built a shared component library.
            </p>
          </div>
          <div className="mt-5 border-t border-line pt-5">
            <h2 className="text-sm font-semibold">Skills</h2>
            <p className="mt-2 text-sm text-muted">
              Research · Figma · Prototyping · Accessibility
            </p>
          </div>
          <div className="home-preview-footer"><span><Icon name="check" />Ready to share</span><Icon name="arrow" /></div>
        </div>
      </div>
    </section>
  )
}
