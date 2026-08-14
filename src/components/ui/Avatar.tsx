import { cn } from '../../lib/cn'

interface AvatarProps {
  nome: string
  src?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_CLASSES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-16 w-16 text-lg',
}

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/)
  const primeira = partes[0]?.[0] ?? ''
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : ''
  return (primeira + ultima).toUpperCase()
}

export function Avatar({ nome, src, size = 'md', className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={nome}
        className={cn('rounded-full border border-border object-cover', SIZE_CLASSES[size], className)}
      />
    )
  }
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full border border-border bg-accent-muted font-heading font-bold text-accent',
        SIZE_CLASSES[size],
        className,
      )}
      aria-hidden="true"
    >
      {iniciais(nome)}
    </div>
  )
}
