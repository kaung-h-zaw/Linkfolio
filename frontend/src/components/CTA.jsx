import { Link } from 'react-router-dom'
export default function CTA() {
  return (
    <section className="border-y border-line bg-paper">
      <div className="shell flex flex-wrap items-center justify-between gap-5 py-10">
        <div>
          <h2 className="text-2xl font-semibold">Ready to make your resume?</h2>
          <p className="mt-2 text-muted">
            Start with a template and fill in your details.
          </p>
        </div>
        <Link to="/setup" className="button button-green">
          Create a resume
        </Link>
      </div>
    </section>
  )
}
