export default function LogoMark({ className = 'h-8 w-8' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" width="32" height="32" className={`shrink-0 ${className}`}>
      <rect width="32" height="32" rx="8" fill="var(--app-brand, #137763)"/>
      <path d="M9 8h6v12h10v5H9z" fill="var(--app-on-brand, #F4F1E6)"/>
      <circle cx="21" cy="11" r="3.2" fill="var(--app-on-brand, #F4F1E6)"/>
    </svg>
  )
}
