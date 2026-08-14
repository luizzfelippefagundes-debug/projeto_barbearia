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
  Package,
  Tv,
} from 'lucide-react'
import { cn } from '../../lib/cn'
import { NOME_BARBEARIA } from '../../lib/constants'

const NAV_ITEMS = [
  { href: '/admin/agenda', label: 'Agenda', icon: CalendarDays },
  { href: '/admin/clientes', label: 'Clientes', icon: Users },
  { href: '/admin/barbeiros', label: 'Barbeiros', icon: Scissors },
  { href: '/admin/assinaturas', label: 'Assinaturas', icon: Repeat },
  { href: '/admin/financeiro', label: 'Financeiro', icon: LineChart },
  { href: '/admin/produtos', label: 'Produtos', icon: Package },
  { href: '/admin/painel-ao-vivo', label: 'Painel ao Vivo', icon: Tv },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-16 shrink-0 flex-col border-r border-border bg-surface lg:w-60">
      <div className="flex items-center gap-2 border-b border-border px-3 py-4 lg:px-5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-accent text-accent">
          <Scissors size={16} aria-hidden="true" />
        </span>
        <span className="hidden font-heading text-sm tracking-wide text-accent uppercase lg:inline">
          {NOME_BARBEARIA}
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto py-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              title={label}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 border-l-2 px-4 py-2.5 font-heading text-sm tracking-wide uppercase transition-colors',
                active
                  ? 'border-accent bg-accent-muted text-text-primary'
                  : 'border-transparent text-text-secondary hover:bg-surface-raised hover:text-text-primary',
              )}
            >
              <Icon size={18} className="shrink-0" aria-hidden="true" />
              <span className="hidden lg:inline">{label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="flex items-center gap-2 border-t border-border px-3 py-3 lg:px-5">
        <UserButton />
        <span className="hidden text-xs text-text-secondary lg:inline">Painel do dono</span>
      </div>
    </aside>
  )
}
