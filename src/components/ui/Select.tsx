import type { SelectHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import { FIELD_CLASSES } from './Input'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
}

export function Select({ label, id, className, children, ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-xs text-text-secondary">
          {label}
        </label>
      )}
      <select id={id} className={cn(FIELD_CLASSES, className)} {...props}>
        {children}
      </select>
    </div>
  )
}
