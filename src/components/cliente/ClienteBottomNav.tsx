'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarPlus, CreditCard, Home, User } from 'lucide-react'
import { cn } from '../../lib/cn'

const ITEMS = [
  { href: '/cliente', label: 'Início', icon: Home },
  { href: '/cliente/agendar', label: 'Agendar', icon: CalendarPlus },
  { href: '/cliente/assinar', label: 'Assinar', icon: CreditCard },
  { href: '/cliente/perfil', label: 'Perfil', icon: User },
]

export function ClienteBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed inset-x-4 z-10 lg:hidden"
      style={{ bottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
    >
      <div className="mx-auto flex max-w-md items-stretch justify-between gap-1 rounded-full border border-border/60 bg-surface/70 px-2 py-1.5 shadow-lg shadow-black/20 backdrop-blur-xl">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === '/cliente' ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center gap-0.5 rounded-full py-2 text-[11px] transition-colors',
                active ? 'bg-accent/15 text-accent' : 'text-text-secondary',
              )}
            >
              <Icon size={20} aria-hidden="true" />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
