'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { CalendarDays, Wallet, Package, Scissors } from 'lucide-react'
import { cn } from '../../lib/cn'
import { NOME_BARBEARIA } from '../../lib/constants'

const NAV_ITEMS = [
  { href: '/barbeiro/agenda', label: 'Minha agenda', icon: CalendarDays },
  { href: '/barbeiro/comissao', label: 'Minha comissão', icon: Wallet },
  { href: '/barbeiro/produtos', label: 'Vender produto', icon: Package },
]

export function BarbeiroSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-16 shrink-0 flex-col border-r border-border bg-surface lg:w-64">
      <div className="flex items-center gap-2.5 px-4 py-5 lg:px-6">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-white">
          <Scissors size={16} aria-hidden="true" />
        </span>
        <span className="hidden font-heading text-base font-bold text-text-primary lg:inline">
          {NOME_BARBEARIA}
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
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
        <span className="hidden text-xs text-text-secondary lg:inline">Barbeiro</span>
      </div>
    </aside>
  )
}
