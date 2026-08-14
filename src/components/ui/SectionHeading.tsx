import type { ReactNode } from 'react'

interface SectionHeadingProps {
  children: ReactNode
  action?: ReactNode
}

export function SectionHeading({ children, action }: SectionHeadingProps) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3 border-b border-accent/40 pb-2">
      <h2 className="text-lg text-text-primary">{children}</h2>
      {action}
    </div>
  )
}
