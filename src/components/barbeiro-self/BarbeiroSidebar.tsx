'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { CalendarDays, Wallet, Package, User, Menu, ArrowLeftRight } from 'lucide-react'
import { cn } from '../../lib/cn'
import { NOME_BARBEARIA } from '../../lib/constants'
import { LogoMark } from '../ui/LogoMark'
import { IconButton } from '../ui/IconButton'
import { MobileNavDrawer } from '../ui/MobileNavDrawer'
import { SairButton } from '../auth/SairButton'
import { ThemeToggle } from '../theme/ThemeToggle'

const NAV_ITEMS = [
  { href: '/barbeiro/agenda', label: 'Minha agenda', icon: CalendarDays },
  { href: '/barbeiro/comissao', label: 'Minha comissão', icon: Wallet },
  { href: '/barbeiro/produtos', label: 'Vender produto', icon: Package },
  { href: '/barbeiro/perfil', label: 'Meu perfil', icon: User },
]

function NavLinks({ expanded, onNavigate }: { expanded: boolean; onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href)
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

export function BarbeiroSidebar({ nome, ehDono }: { nome: string; ehDono?: boolean }) {
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
        {ehDono && (
          <div className="border-t border-border px-3 py-2">
            <Link
              href="/admin"
              onClick={() => setDrawerAberto(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary"
            >
              <ArrowLeftRight size={18} className="shrink-0" aria-hidden="true" />
              Painel do dono
            </Link>
          </div>
        )}
        <div className="flex items-center gap-2.5 border-t border-border px-4 py-4">
          <UserButton />
          <span className="flex-1 truncate text-xs text-text-secondary">{nome}</span>
          <ThemeToggle />
          <SairButton redirectUrl="/entrar/barbeiro" />
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

        {ehDono && (
          <div className="border-t border-border px-3 py-2 lg:px-4">
            <Link
              href="/admin"
              title="Painel do dono"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary"
            >
              <ArrowLeftRight size={18} className="shrink-0" aria-hidden="true" />
              <span className="hidden lg:inline">Painel do dono</span>
            </Link>
          </div>
        )}

        <div className="flex items-center gap-2.5 border-t border-border px-4 py-4 lg:px-6">
          <UserButton />
          <span className="hidden flex-1 truncate text-xs text-text-secondary lg:inline">{nome}</span>
          <ThemeToggle />
          <SairButton redirectUrl="/entrar/barbeiro" />
        </div>
      </aside>
    </>
  )
}
