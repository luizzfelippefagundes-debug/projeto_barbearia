import Link from 'next/link'
import { CalendarPlus, CreditCard, Sparkles, User } from 'lucide-react'
import { Card } from '../../components/ui'
import { NOME_BARBEARIA } from '../../lib/constants'

const LINKS = [
  { href: '/cliente/agendar', label: 'Agendar horário', icon: CalendarPlus },
  { href: '/cliente/assinar', label: 'Assinar plano', icon: CreditCard },
  { href: '/cliente/perfil', label: 'Meu perfil', icon: User },
  { href: '/cliente/preview-corte', label: 'Preview de corte com IA', icon: Sparkles },
]

export default function PublicHomePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl text-accent">{NOME_BARBEARIA}</h1>
        <p className="text-sm text-text-secondary">Corte clássico, atendimento sob medida.</p>
      </div>

      <div className="flex flex-col gap-3">
        {LINKS.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}>
            <Card className="flex items-center gap-3 px-4 py-4 hover:border-brass">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-accent text-accent">
                <Icon size={18} aria-hidden="true" />
              </span>
              <span className="text-sm text-text-primary">{label}</span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
