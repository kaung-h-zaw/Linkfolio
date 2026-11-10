export default function ProfileProgress({ completed, total }) {
  const percent = Math.round((completed / total) * 100)
  return (
    <div className="px-1 py-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <label htmlFor="profile-progress" className="font-medium">
          Profile completion
        </label>
        <span className="font-semibold text-accent">{percent}%</span>
      </div>
      <progress
        id="profile-progress"
        max="100"
        value={percent}
        className="mt-3 block h-1.5 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-sage [&::-webkit-progress-value]:bg-accent [&::-moz-progress-bar]:bg-accent"
      />
      <p className="mt-3 text-xs leading-5 text-muted">
        {completed} of {total} sections started. Add what’s relevant to you —
        every section is optional.
      </p>
    </div>
  )
}
