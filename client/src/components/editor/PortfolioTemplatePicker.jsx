import { getProjects } from '../../lib/additionalSections'
import { portfolioDemoImages } from '../../lib/portfolioImages'
import PortfolioPreview from '../PortfolioPreview'
import { sampleProfile } from '../resumeTemplates'
import { defaultPortfolio } from '../../lib/portfolio'
import { useState } from 'react'
import { portfolioTemplates, sourcedPortfolioTemplates } from '../../lib/portfolioTemplates'
import { useTemplateAccess } from '../../lib/templateAccess'

// Use the same typography and layout styles as the real portfolio, without
// duplicating its navigation targets or adding interactive links to the card.
function TemplateThumbnail({ template, color, surface, profile, settings }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 900 980" className="block w-full border-b border-line">
      <foreignObject width="900" height="6000">
        <div xmlns="http://www.w3.org/1999/xhtml" inert>
          <PortfolioPreview
            profile={profile || sampleProfile}
            settings={{ ...defaultPortfolio, color, surface, images: profile ? settings?.images : { portrait: portfolioDemoImages.portrait, cover: portfolioDemoImages.cover, projects: Object.fromEntries(getProjects(sampleProfile).entries.map((project,index) => [project.id,portfolioDemoImages.projectCovers[index % 3]])) }, ...settings, template:template.id }}
          />
        </div>
      </foreignObject>
    </svg>
  )
}

export default function PortfolioTemplatePicker({ value, color, surface = '#f1f6f2', profile, settings, onChange }) {
  const [category, setCategory] = useState('All')
  const access = useTemplateAccess()
  const filtered = sourcedPortfolioTemplates.filter(
    (template) => category === 'All' || template.category === category,
  )
  const selected = portfolioTemplates.find((template) => template.id === value)
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-sm font-semibold">Portfolio template</legend>
      <p className="text-xs leading-5 text-muted">
        {sourcedPortfolioTemplates.length} original Linkfolio designs, informed by web research. Each has its own composition and works with the same design controls.
      </p>
      <div
        role="group"
        aria-label="Filter portfolio templates"
        className="my-4 flex flex-wrap gap-2"
      >
        {['All', 'Clean', 'Creative', 'Editorial', 'Professional'].map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={category === item}
            onClick={() => setCategory(item)}
            className={`min-h-9 rounded-full border px-3 text-xs font-medium ${category === item ? 'border-accent bg-sage text-accent' : 'border-line bg-white text-muted'}`}
          >
            {item}
          </button>
        ))}
      </div>
      <p
        className="mb-3 flex flex-wrap justify-between gap-2 text-xs text-muted"
        aria-live="polite"
      >
        <span>{filtered.length} templates</span>
        <span>Selected: {selected?.name || 'Essential'}</span>
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {filtered.map((template) => (
          <div key={template.id} className="min-w-0">
          <button
            type="button"
            onClick={() => onChange(template.id)}
            disabled={!access(template.id, 'portfolio').allowed}
            aria-label={`Use ${template.name} template`}
            aria-pressed={value === template.id}
            className={`min-w-0 overflow-hidden rounded-lg border text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${value === template.id ? 'border-accent bg-white ring-1 ring-accent' : 'border-line bg-white hover:border-accent'}`}
          >
            <TemplateThumbnail template={template} color={color} surface={surface} profile={profile} settings={settings} />
            <span className="block p-3 text-sm font-semibold">{template.name}</span>
            {!access(template.id, 'portfolio').allowed && <span className="sr-only">Premium template</span>}
          </button>
          </div>
        ))}
      </div>
    </fieldset>
  )
}
