import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export function TabsList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <nav className={cn('flex gap-1 overflow-x-auto border-b border-border', className)}>
      {children}
    </nav>
  )
}

export function tabTriggerClasses(active: boolean): string {
  return cn(
    'flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 font-heading text-sm tracking-wide uppercase transition-colors',
    active
      ? 'border-accent text-text-primary'
      : 'border-transparent text-text-secondary hover:text-text-primary',
  )
}

interface TabTriggerProps {
  active: boolean
  icon?: ReactNode
  children: ReactNode
  onClick?: () => void
}

export function TabTrigger({ active, icon, children, onClick }: TabTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={tabTriggerClasses(active)}
      aria-current={active ? 'page' : undefined}
    >
      {icon}
      {children}
    </button>
  )
}
