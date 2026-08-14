import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-border bg-surface-raised px-2.5 py-1 text-xs text-text-secondary',
        className,
      )}
      {...props}
    />
  )
}
