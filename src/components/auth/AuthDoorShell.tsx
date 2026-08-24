import Image from 'next/image'
import type { LucideIcon } from 'lucide-react'
import { NOME_BARBEARIA } from '../../lib/constants'
import { LogoMark } from '../ui/LogoMark'
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
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden bg-black p-4">
      <Image
        src="/logo.jpg"
        alt=""
        fill
        priority
        aria-hidden="true"
        className="scale-125 object-cover object-center opacity-25"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black" />

      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="relative z-10 flex items-center gap-2">
        <LogoMark />
        <span className="font-heading text-sm font-bold text-white">{NOME_BARBEARIA}</span>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-1 text-center">
        <span className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-accent-muted text-accent">
          <Icon size={18} aria-hidden="true" />
        </span>
        <h1 className="text-lg text-white">{titulo}</h1>
        <p className="max-w-xs text-sm text-white/70">{descricao}</p>
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  )
}
