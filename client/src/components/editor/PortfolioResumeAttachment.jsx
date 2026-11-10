export default function PortfolioResumeAttachment({ settings, onChange }) {
  const enabled = Boolean(settings.resumeDownload)
  return (
    <section className="space-y-4 rounded-md border border-line bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-semibold">Resume download</h2>
        <button type="button" role="switch" aria-checked={enabled} aria-label="Resume download"
          onClick={() => onChange({ ...settings, resumeDownload: !enabled, resumeFile: null })}
          className={`flex min-h-11 items-center gap-3 rounded px-1 text-xs font-semibold ${enabled ? 'text-accent' : 'text-muted'}`}>
          {enabled ? 'On' : 'Off'}
          <span aria-hidden="true" className={`relative block h-6 w-11 rounded-full transition-colors ${enabled ? 'bg-accent' : 'bg-slate-300'}`}>
            <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} style={{ left: 0 }} />
          </span>
        </button>
      </div>
      <p className="text-xs leading-5 text-muted">{enabled
        ? 'Visitors can download a PDF of your selected resume, with its saved content and design.'
        : 'Turn on to show a Download resume button on your portfolio.'}</p>
      {enabled && <p className="rounded border border-line bg-paper p-3 text-xs text-muted">Uses the selected resume automatically, including updates you save in the resume editor.</p>}
    </section>
  )
}
