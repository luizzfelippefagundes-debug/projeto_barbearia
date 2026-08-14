import { cn } from '../../lib/cn'

interface ProgressBarProps {
  value: number
  max: number
  colorClassName?: string
  trackClassName?: string
  className?: string
  label?: string
}

export function ProgressBar({
  value,
  max,
  colorClassName = 'bg-brass',
  trackClassName = 'bg-surface-raised',
  className,
  label,
}: ProgressBarProps) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
  return (
    <div
      className={cn('h-2 w-full overflow-hidden rounded border border-border', trackClassName, className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
    >
      <div
        className={cn('h-full rounded transition-[width]', colorClassName)}
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}
