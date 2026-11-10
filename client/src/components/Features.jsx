import Icon from './Icon'
const features = [
  [
    'file',
    'Resume templates',
    'Choose a layout and make it yours with colors, fonts, and flexible sections.',
  ],
  ['edit', 'Live editing', 'See your changes immediately as you type.'],
  [
    'folder',
    'Flexible sections',
    'Add experience, projects, skills, or your own custom section.',
  ],
  [
    'user',
    'One professional profile',
    'Use the same experience and projects for your resume and portfolio.',
  ],
]
export default function Features() {
  return (
    <section id="features" className="shell py-12">
      <h2 className="section-title">Focus on your content</h2>
      <div className="mt-7 grid gap-7 sm:grid-cols-2">
        {features.map(([icon, title, text]) => (
          <div key={title} className="home-feature-card flex gap-4">
            <Icon name={icon} className="mt-1 h-5 w-5 shrink-0 text-accent" />
            <div>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-base leading-7 text-muted">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
