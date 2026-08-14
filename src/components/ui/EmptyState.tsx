import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded border border-dashed border-border px-6 py-10 text-center">
      {icon && <div className="text-text-secondary">{icon}</div>}
      <p className="font-heading text-sm tracking-wide text-text-primary uppercase">{title}</p>
      {description && <p className="max-w-xs text-sm text-text-secondary">{description}</p>}
    </div>
  )
}
