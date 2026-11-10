import Icon from './Icon'

export function ProfilePreview() {
  return (
    <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between border-b border-line pb-3">
        <span className="flex items-center gap-2 text-xs font-semibold">
          <Icon name="user" className="h-4 w-4" />
          Professional profile
        </span>
        <span className="flex items-center gap-1 text-[10px] text-accent">
          <Icon name="check" className="h-3 w-3" />
          All changes saved
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sage font-serif text-xl text-accent">
          AJ
        </span>
        <div>
          <p className="text-sm font-semibold">Alex Johnson</p>
          <p className="mt-1 text-xs text-muted">
            Product designer & creative thinker
          </p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {[
          ['Experience', 'Product Designer'],
          ['Education', 'B.A. in Design'],
        ].map(([label, value]) => (
          <div key={label}>
            <p className="mb-1.5 text-[10px] text-muted">{label}</p>
            <p className="rounded border border-line bg-paper px-2.5 py-2 text-[11px]">
              {value}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {['UI / UX Design', 'Figma', 'Web Design'].map((skill) => (
          <span
            key={skill}
            className="rounded bg-sage/60 px-2 py-1 text-[9px] text-accent"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  )
}

export function ResumePreview({ compact = false }) {
  return (
    <div
      className={`resume-paper h-full bg-white ${compact ? 'p-4' : 'p-7 sm:p-9'}`}
    >
      <p className={`font-serif ${compact ? 'text-sm' : 'text-2xl'}`}>
        Alex Johnson
      </p>
      <p className="mt-1 text-[9px] tracking-wide text-muted">
        PRODUCT DESIGNER
      </p>
      {!compact && (
        <p className="mt-3 text-[9px] text-muted">
          alex@example.com · San Francisco, CA
        </p>
      )}
      <div className="my-4 h-px bg-ink" />
      {['Profile', 'Experience', 'Education', 'Skills']
        .slice(0, compact ? 3 : 4)
        .map((label, index) => (
          <div className="mb-4" key={label}>
            <p className="mb-2 text-[9px] font-bold uppercase tracking-wider">
              {label}
            </p>
            {!compact && (
              <p className="mb-2 text-[10px] text-muted">
                {
                  [
                    'Thoughtful digital experiences, made for people.',
                    'Product Designer · Studio North',
                    'B.A. in Design · 2020–2024',
                    'UI / UX Design · Figma · Web Design',
                  ][index]
                }
              </p>
            )}
            <div aria-hidden="true" className="space-y-1.5">
              <div className="h-1 rounded-sm bg-stone-200" />
              <div className="h-1 w-4/5 rounded-sm bg-stone-100" />
              {!compact && (
                <div className="h-1 w-11/12 rounded-sm bg-stone-100" />
              )}
            </div>
          </div>
        ))}
    </div>
  )
}

export function PortfolioPreview({ compact = false }) {
  return (
    <div className="h-full bg-[#edf1e9]">
      <div
        className="flex items-center gap-1 border-b border-line bg-white px-3 py-2"
        aria-hidden="true"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-stone-300" />
        <span className="h-1.5 w-1.5 rounded-full bg-stone-300" />
        <span className="h-1.5 w-1.5 rounded-full bg-stone-300" />
        <span className="ml-2 truncate text-[8px] text-muted">
          linkfolio.site/alexjohnson
        </span>
      </div>
      <div className={compact ? 'p-4' : 'p-6 sm:p-8'}>
        <div className="flex items-center justify-between text-[9px]">
          <span className="font-bold">alex.</span>
          <span className="text-muted">Work &nbsp; About &nbsp; Contact</span>
        </div>
        <p className="mb-2 mt-7 text-[8px] font-medium uppercase tracking-widest text-accent">
          Hello, I’m Alex
        </p>
        <p
          className={`font-serif leading-tight ${compact ? 'text-lg' : 'text-3xl'}`}
        >
          Thoughtful design.
          <br />
          Meaningful impact.
        </p>
        <p className="mt-3 text-[9px] leading-relaxed text-muted">
          Product designer turning complex problems
          <br />
          into simple, human experiences.
        </p>
        <p className="mt-4 flex items-center gap-1 text-[9px] font-semibold">
          Selected work <Icon name="arrow" className="h-3 w-3" />
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3" aria-hidden="true">
          <div
            className={`flex items-center justify-center bg-[#d1dccc] ${compact ? 'h-16' : 'h-28'}`}
          >
            <div className="w-3/4 -rotate-6 rounded-sm bg-[#faf8f1] p-2 shadow-sm">
              <div className="mb-2 h-1 w-1/3 bg-accent/50" />
              <div className="grid grid-cols-3 gap-1">
                <div className="h-7 bg-[#dfbbae]" />
                <div className="h-7 bg-[#e0d6b8]" />
                <div className="h-7 bg-[#bdc9b6]" />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center bg-[#e8dccb]">
            <div className="rotate-6 rounded-md border-[3px] border-ink bg-paper p-2">
              <div className="h-1 w-5 bg-stone-300" />
              <div className="my-2 h-6 w-9 rounded-full bg-[#bbccac]" />
              <div className="h-1 w-7 bg-stone-300" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
