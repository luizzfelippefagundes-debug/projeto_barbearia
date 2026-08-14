import type { ReactNode } from 'react'

interface SectionHeadingProps {
  children: ReactNode
  action?: ReactNode
}

export function SectionHeading({ children, action }: SectionHeadingProps) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <h2 className="text-xl text-text-primary">{children}</h2>
      {action}
    </div>
  )
}
