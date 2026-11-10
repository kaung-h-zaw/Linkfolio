export default function LogoMark({ className = 'h-8 w-8' }) {
  return (
    <img
      src="/linkfolio-mark.svg"
      alt=""
      aria-hidden="true"
      width="32"
      height="32"
      className={`shrink-0 ${className}`}
    />
  )
}
