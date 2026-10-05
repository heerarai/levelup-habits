export default function ProgressBar({ pct, track = 'bg-slate-200', fill = 'bg-grape', height = 'h-2.5' }) {
  return (
    <div className={`${height} w-full overflow-hidden rounded-full ${track}`} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full ${fill} transition-all duration-500`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  )
}
