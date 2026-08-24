'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import {
  CalendarDays,
  Users,
  Scissors,
  Repeat,
  LineChart,
  LayoutDashboard,
  Package,
  Tag,
  Tv,
} from 'lucide-react'
import { cn } from '../../lib/cn'
import { NOME_BARBEARIA } from '../../lib/constants'
import { LogoMark } from '../ui/LogoMark'
import { SairButton } from '../auth/SairButton'
import { ThemeToggle } from '../theme/ThemeToggle'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/agenda', label: 'Agenda', icon: CalendarDays },
  { href: '/admin/clientes', label: 'Clientes', icon: Users },
  { href: '/admin/barbeiros', label: 'Barbeiros', icon: Scissors },
  { href: '/admin/servicos', label: 'Serviços', icon: Tag },
  { href: '/admin/assinaturas', label: 'Assinaturas', icon: Repeat },
  { href: '/admin/financeiro', label: 'Financeiro', icon: LineChart },
  { href: '/admin/produtos', label: 'Produtos', icon: Package },
  { href: '/admin/painel-ao-vivo', label: 'Painel ao Vivo', icon: Tv },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-16 shrink-0 flex-col border-r border-border bg-surface lg:w-64">
      <div className="flex items-center gap-2.5 px-4 py-5 lg:px-6">
        <LogoMark />
        <span className="hidden font-heading text-base font-bold text-text-primary lg:inline">
          {NOME_BARBEARIA}
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === '/admin' ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              title={label}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-accent-muted text-accent'
                  : 'text-text-secondary hover:bg-surface-raised hover:text-text-primary',
              )}
            >
              <Icon size={18} className="shrink-0" aria-hidden="true" />
              <span className="hidden lg:inline">{label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="flex items-center gap-2.5 border-t border-border px-4 py-4 lg:px-6">
        <UserButton />
        <span className="hidden flex-1 text-xs text-text-secondary lg:inline">Painel do dono</span>
        <ThemeToggle />
        <SairButton redirectUrl="/entrar/dono" />
      </div>
    </aside>
  )
}
