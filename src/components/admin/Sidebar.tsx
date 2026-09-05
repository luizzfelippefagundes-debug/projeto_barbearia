'use client'

import { useState } from 'react'
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
  Menu,
} from 'lucide-react'
import { cn } from '../../lib/cn'
import { NOME_BARBEARIA } from '../../lib/constants'
import { LogoMark } from '../ui/LogoMark'
import { IconButton } from '../ui/IconButton'
import { MobileNavDrawer } from '../ui/MobileNavDrawer'
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
]

function NavLinks({ expanded, onNavigate }: { expanded: boolean; onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = href === '/admin' ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            title={label}
            aria-current={active ? 'page' : undefined}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'bg-accent-muted text-accent'
                : 'text-text-secondary hover:bg-surface-raised hover:text-text-primary',
            )}
          >
            <Icon size={18} className="shrink-0" aria-hidden="true" />
            <span className={expanded ? 'inline' : 'hidden lg:inline'}>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export function Sidebar({ nome }: { nome: string }) {
  const [drawerAberto, setDrawerAberto] = useState(false)

  return (
    <>
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2.5">
          <LogoMark />
          <span className="font-heading text-base font-bold text-text-primary">{NOME_BARBEARIA}</span>
        </div>
        <IconButton icon={<Menu size={18} aria-hidden="true" />} label="Abrir menu" onClick={() => setDrawerAberto(true)} />
      </div>

      <MobileNavDrawer open={drawerAberto} onClose={() => setDrawerAberto(false)}>
        <div className="flex items-center gap-2.5 px-4 py-5">
          <LogoMark />
          <span className="font-heading text-base font-bold text-text-primary">{NOME_BARBEARIA}</span>
        </div>
        <NavLinks expanded onNavigate={() => setDrawerAberto(false)} />
        <div className="flex items-center gap-2.5 border-t border-border px-4 py-4">
          <UserButton />
          <span className="flex-1 truncate text-xs text-text-secondary">{nome}</span>
          <ThemeToggle />
          <SairButton redirectUrl="/entrar/dono" />
        </div>
      </MobileNavDrawer>

      <aside className="hidden h-screen w-16 shrink-0 flex-col border-r border-border bg-surface lg:flex lg:w-64">
        <div className="flex items-center gap-2.5 px-4 py-5 lg:px-6">
          <LogoMark />
          <span className="hidden font-heading text-base font-bold text-text-primary lg:inline">
            {NOME_BARBEARIA}
          </span>
        </div>

        <NavLinks expanded={false} />

        <div className="flex items-center gap-2.5 border-t border-border px-4 py-4 lg:px-6">
          <UserButton />
          <span className="hidden flex-1 truncate text-xs text-text-secondary lg:inline">{nome}</span>
          <ThemeToggle />
          <SairButton redirectUrl="/entrar/dono" />
        </div>
      </aside>
    </>
  )
}
