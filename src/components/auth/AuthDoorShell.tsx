import type { LucideIcon } from 'lucide-react'
import { Scissors } from 'lucide-react'
import { NOME_BARBEARIA } from '../../lib/constants'
import { ThemeToggle } from '../theme/ThemeToggle'

export function AuthDoorShell({
  icon: Icon,
  titulo,
  descricao,
  children,
}: {
  icon: LucideIcon
  titulo: string
  descricao: string
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-6 bg-bg p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white">
          <Scissors size={16} aria-hidden="true" />
        </span>
        <span className="font-heading text-sm font-bold text-text-primary">{NOME_BARBEARIA}</span>
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <span className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-accent-muted text-accent">
          <Icon size={18} aria-hidden="true" />
        </span>
        <h1 className="text-lg text-text-primary">{titulo}</h1>
        <p className="max-w-xs text-sm text-text-secondary">{descricao}</p>
      </div>

      {children}
    </div>
  )
}
