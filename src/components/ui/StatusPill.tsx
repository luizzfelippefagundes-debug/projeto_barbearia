import type { ReactNode } from 'react'
import { getStatusVisual } from '../../lib/statusMap'
import { cn } from '../../lib/cn'

interface StatusPillProps {
  status: string
  label?: ReactNode
  className?: string
}

export function StatusPill({ status, label, className }: StatusPillProps) {
  const visual = getStatusVisual(status)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-xs font-medium tracking-wide uppercase',
        visual.text,
        visual.bg,
        visual.border,
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {label ?? visual.label}
    </span>
  )
}
