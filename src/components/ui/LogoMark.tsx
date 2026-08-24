import Image from 'next/image'
import { cn } from '../../lib/cn'

const SIZE_CLASSES = {
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
  lg: 'h-16 w-16',
}

export function LogoMark({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  return (
    <Image
      src="/logo.jpg"
      alt="Jota Pê Barbearia"
      width={128}
      height={128}
      priority
      className={cn('rounded-xl object-cover', SIZE_CLASSES[size], className)}
    />
  )
}
