import Link from 'next/link'
import { CalendarPlus, ChevronRight, CreditCard, User } from 'lucide-react'
import { Card } from '../../components/ui'
import { NOME_BARBEARIA } from '../../lib/constants'

const LINKS = [
  {
    href: '/cliente/agendar',
    label: 'Agendar horário',
    descricao: 'Escolha o barbeiro, o serviço e o horário.',
    icon: CalendarPlus,
  },
  {
    href: '/cliente/assinar',
    label: 'Assinar plano',
    descricao: 'Pague menos por corte e economize todo mês.',
    icon: CreditCard,
  },
  {
    href: '/cliente/perfil',
    label: 'Meu perfil',
    descricao: 'Histórico, fidelidade e sua assinatura.',
    icon: User,
  },
]

export default function PublicHomePage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-2xl border border-border bg-surface p-6 lg:p-10">
        <h1 className="text-2xl text-accent lg:text-4xl">{NOME_BARBEARIA}</h1>
        <p className="mt-1 text-sm text-text-secondary lg:text-base">
          Corte clássico, atendimento sob medida.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {LINKS.map(({ href, label, descricao, icon: Icon }) => (
          <Link key={href} href={href}>
            <Card className="flex h-full items-center gap-3 px-4 py-4 hover:border-brass lg:flex-col lg:items-start lg:gap-4 lg:p-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent text-accent lg:h-12 lg:w-12">
                <Icon size={18} aria-hidden="true" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-medium text-text-primary lg:text-base">{label}</span>
                <span className="hidden text-xs text-text-secondary lg:mt-1 lg:block">{descricao}</span>
              </span>
              <ChevronRight size={16} className="text-text-secondary lg:hidden" aria-hidden="true" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
