import { Link } from 'react-router-dom'
export default function ResumePortfolioShowcase() {
  return (
    <section id="demo" className="border-y border-line bg-paper py-12">
      <div className="shell">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="section-title">One profile, two formats</h2>
          <Link to="/setup" className="nav-link font-medium text-accent">
            Browse resume templates →
          </Link>
        </div>
        <div className="mt-7 grid gap-5 md:grid-cols-2">
          <article className="rounded-lg border border-line bg-white p-6">
            <p className="mb-5 text-sm font-medium text-muted">Resume</p>
            <h3 className="text-xl font-semibold">Alex Morgan</h3>
            <p className="mt-1 text-muted">Product Designer</p>
            <div className="mt-5 border-t border-line pt-4">
              <p className="font-medium">Experience</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Senior Product Designer · North Studio
                <br />
                2023 – Present
              </p>
            </div>
            <p className="mt-5 text-sm text-muted">
              A structured document for job applications.
            </p>
          </article>
          <article className="rounded-lg border border-line bg-white p-6">
            <div className="mb-5 flex justify-between gap-3 text-sm text-muted">
              <span>Portfolio website</span>
              <span>Share online</span>
            </div>
            <h3 className="text-xl font-semibold">Hi, I’m Alex.</h3>
            <p className="mt-1 text-muted">I design useful digital products.</p>
            <div className="mt-5 border-t border-line pt-4">
              <p className="font-medium">Selected work</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Everyday Notes
                <br />
                Research, prototyping, and product design
              </p>
            </div>
            <p className="mt-5 text-sm text-muted">
              A place to share your projects and experience.
            </p>
          </article>
        </div>
        <p className="mt-4 text-sm text-muted">
          Example content. Download your resume as a PDF and publish your portfolio when you’re ready.
        </p>
      </div>
    </section>
  )
}
