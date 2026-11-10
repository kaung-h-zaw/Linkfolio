import { Link } from 'react-router-dom'
export default function PricingPreview() {
  return (
    <section id="pricing" className="shell border-t border-line py-10">
      <h2 className="section-title">Plans</h2>
      <p className="mt-3 text-muted">
        Start free and upgrade when you need more room for your work.
      </p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <article className="rounded-lg border border-line p-6">
          <h3 className="text-xl font-semibold">Free</h3>
          <p className="mt-3 leading-7 text-muted">1 resume · 1 portfolio · Free templates</p>
          <Link
            to="/setup"
            className="mt-5 inline-block font-medium text-accent underline underline-offset-4"
          >
            Get started
          </Link>
        </article>
        <article className="rounded-lg border border-line p-6">
          <h3 className="text-xl font-semibold">Premium</h3>
          <p className="mt-3 leading-7 text-muted">
            More resumes and portfolios, plus premium templates.
          </p>
          <Link to="/premium" className="mt-5 inline-block text-accent underline">
            View your plan and upgrade
          </Link>
        </article>
      </div>
    </section>
  )
}
