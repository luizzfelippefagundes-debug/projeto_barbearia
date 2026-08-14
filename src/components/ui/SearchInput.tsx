import { Search } from 'lucide-react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export function SearchInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative w-full">
      <Search
        size={16}
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-secondary"
        aria-hidden="true"
      />
      <input
        type="search"
        className={cn(
          'w-full rounded border border-border bg-surface py-2 pr-3 pl-9 text-sm text-text-primary placeholder:text-text-secondary focus:border-brass',
          className,
        )}
        {...props}
      />
    </div>
  )
}
