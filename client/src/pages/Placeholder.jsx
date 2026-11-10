import { Link } from 'react-router-dom'
export default function Placeholder({ title }) {
  return (
    <main className="shell py-20">
      <h1 tabIndex={-1} className="text-2xl font-semibold">
        {title}
      </h1>
      <p className="mt-4 text-muted">This page is not available yet.</p>
      <Link to="/" className="mt-6 inline-block underline underline-offset-4">
        Back to Linkfolio
      </Link>
    </main>
  )
}
