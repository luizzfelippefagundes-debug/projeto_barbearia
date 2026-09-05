import { NOME_BARBEARIA } from '../../lib/constants'
import { LogoMark } from '../ui/LogoMark'

export function AuthDoorShell({
  titulo,
  descricao,
  children,
}: {
  titulo: string
  descricao: string
  children: React.ReactNode
}) {
  return (
    <div className="theme-forcar-claro relative flex min-h-screen flex-col items-center justify-center gap-6 bg-bg p-4">
      <div className="flex items-center gap-2">
        <LogoMark />
        <span className="font-heading text-sm font-bold text-text-primary">{NOME_BARBEARIA}</span>
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-lg text-text-primary">{titulo}</h1>
        <p className="max-w-xs text-sm text-text-secondary">{descricao}</p>
      </div>

      {children}
    </div>
  )
}
