import Link from 'next/link'
import { CalendarDays, ChevronRight, Crown, Scissors } from 'lucide-react'
import { Card } from '../../components/ui'
import { NOME_BARBEARIA } from '../../lib/constants'
import { LogoMark } from '../ui/LogoMark'

const OPCOES = [
  { href: '/entrar/dono', cadastro: '/cadastro/dono', label: 'Sou o dono', icon: Crown },
  { href: '/entrar/barbeiro', cadastro: '/cadastro/barbeiro', label: 'Sou barbeiro', icon: Scissors },
  { href: '/entrar/cliente', cadastro: '/cadastro/cliente', label: 'Sou cliente', icon: CalendarDays },
]

export function EscolhaAcesso({ modo }: { modo: 'entrar' | 'cadastro' }) {
  return (
    <div className="theme-forcar-claro relative flex min-h-screen flex-col items-center justify-center gap-6 bg-bg p-4">
      <div className="flex items-center gap-2">
        <LogoMark />
        <span className="font-heading text-sm font-bold text-text-primary">{NOME_BARBEARIA}</span>
      </div>

      <div className="text-center">
        <h1 className="text-lg text-text-primary">{modo === 'entrar' ? 'Como você acessa?' : 'Criar conta como...'}</h1>
        <p className="text-sm text-text-secondary">Escolha uma opção pra continuar.</p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-2">
        {OPCOES.map(({ href, cadastro, label, icon: Icon }) => (
          <Link key={href} href={modo === 'entrar' ? href : cadastro}>
            <Card className="flex items-center justify-between gap-3 px-4 py-3.5 hover:border-accent">
              <span className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-muted text-accent">
                  <Icon size={16} aria-hidden="true" />
                </span>
                <span className="text-sm font-medium text-text-primary">{label}</span>
              </span>
              <ChevronRight size={16} className="text-text-secondary" aria-hidden="true" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
