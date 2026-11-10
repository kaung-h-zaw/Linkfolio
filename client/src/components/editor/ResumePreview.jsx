function Section({ title, children }) {
  return (
    <section className="mt-[1.65em]">
      <h3 className="mb-[0.8em] border-b border-slate-300 pb-[0.5em] text-[0.87em] font-bold uppercase tracking-[0.13em]">
        {title}
      </h3>
      {children}
    </section>
  )
}

export default function ResumePreview({ resume }) {
  return (
    <div className="linkfolio-preview mx-auto w-full max-w-[720px]">
      <article
        aria-label="Sample resume document"
        className="linkfolio-sheet bg-white text-slate-700 shadow-[0_3px_18px_rgb(15_23_42/0.07)] ring-1 ring-slate-900/10"
      >
        <header className="border-b-2 border-slate-800 pb-[1.5em]">
          <h2 className="text-[2.8em] font-semibold leading-tight tracking-[-0.04em] text-slate-900">
            {resume.name}
          </h2>
          <p className="mt-[0.35em] text-[1.2em] font-medium">{resume.title}</p>
          <div className="mt-[1em] flex flex-wrap gap-x-[1em] gap-y-[0.3em] text-[0.85em] text-slate-600">
            {resume.contact.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </header>
        <Section title="Summary">
          <p>{resume.summary}</p>
        </Section>
        <Section title="Professional Experience">
          {resume.experience.map((item) => (
            <div key={item.title} className="mb-[1.1em]">
              <div className="flex justify-between gap-[1em]">
                <h4 className="font-bold text-slate-900">{item.title}</h4>
                <span className="shrink-0 text-[0.85em] text-slate-500">
                  {item.dates}
                </span>
              </div>
              <p className="mt-[0.15em] text-[0.95em] text-slate-500">
                {item.organization}
              </p>
              <ul className="mt-[0.5em] list-disc space-y-[0.25em] pl-[1.3em]">
                {item.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </Section>
        <Section title="Education">
          {resume.education.map((item) => (
            <div key={item.title}>
              <div className="flex justify-between gap-[1em]">
                <h4 className="font-bold text-slate-900">{item.title}</h4>
                <span className="shrink-0 text-[0.85em] text-slate-500">
                  {item.dates}
                </span>
              </div>
              <p className="mt-[0.2em] text-slate-500">{item.organization}</p>
            </div>
          ))}
        </Section>
        <Section title="Skills">
          <p>{resume.skills.join(' · ')}</p>
        </Section>
        <Section title="Projects">
          {resume.projects.map((item) => (
            <div key={item.title}>
              <h4 className="font-bold text-slate-900">{item.title}</h4>
              <p className="mt-[0.15em] text-[0.95em] text-slate-500">
                {item.organization}
              </p>
              <p className="mt-[0.5em]">{item.description}</p>
            </div>
          ))}
        </Section>
      </article>
    </div>
  )
}
