import type { InputHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

export function Slider({ label, className, id, ...props }: SliderProps) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-xs text-text-secondary">
          {label}
        </label>
      )}
      <input
        id={id}
        type="range"
        className={cn(
          'h-1.5 w-full cursor-pointer appearance-none rounded-full bg-surface-raised accent-brass',
          className,
        )}
        {...props}
      />
    </div>
  )
}
