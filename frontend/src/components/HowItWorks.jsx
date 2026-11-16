const steps = [
  ['Choose a template', 'Pick a design. You can change it later.'],
  [
    'Add your information',
    'Enter your experience, education, skills, and projects.',
  ],
  ['Make it yours', 'Preview your design, download a PDF, or publish your portfolio.'],
]
export default function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-line bg-paper py-10">
      <div className="shell">
        <h2 className="section-title">How it works</h2>
        <div className="mt-7 grid gap-7 md:grid-cols-3">
          {steps.map(([title, text], i) => (
            <div key={title} className="home-feature-card flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-white text-sm font-semibold">
                {i + 1}
              </span>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
