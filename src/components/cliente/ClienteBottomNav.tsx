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
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === '/cliente' ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-2.5 text-xs',
                active ? 'text-accent' : 'text-text-secondary',
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
