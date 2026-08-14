import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  raised?: boolean
}

export function Card({ raised, className, ...props }: CardProps) {
  return (
    <div className={cn(raised ? 'card-raised' : 'card', className)} {...props} />
  )
}
