import Image from 'next/image'
import { cn } from '../../lib/cn'

const SIZE_CLASSES = {
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
  lg: 'h-16 w-16',
}

export function LogoMark({
  size = 'md',
  className,
  src = '/logo-plataforma.jpg',
}: {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  src?: string
}) {
  return (
    <Image
      src={src}
      alt="Logo"
      width={128}
      height={128}
      priority
      className={cn('rounded-xl object-cover', SIZE_CLASSES[size], className)}
    />
  )
}
