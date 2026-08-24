'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { CalendarPlus, ChevronLeft, CreditCard, Home, User } from 'lucide-react'
import { UserButton } from '@clerk/nextjs'
import { NOME_BARBEARIA } from '../../lib/constants'
import { LogoMark } from '../ui/LogoMark'
import { SairButton } from '../auth/SairButton'
import { ThemeToggle } from '../theme/ThemeToggle'
import { cn } from '../../lib/cn'

const ROTAS_PRINCIPAIS = ['/cliente', '/cliente/agendar', '/cliente/assinar', '/cliente/perfil']

const NAV_ITEMS = [
  { href: '/cliente', label: 'Início', icon: Home },
  { href: '/cliente/agendar', label: 'Agendar', icon: CalendarPlus },
  { href: '/cliente/assinar', label: 'Assinar', icon: CreditCard },
  { href: '/cliente/perfil', label: 'Perfil', icon: User },
]

export function ClienteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const isRotaPrincipal = ROTAS_PRINCIPAIS.includes(pathname)

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3 lg:max-w-5xl">
        <div className="flex items-center gap-1">
          {!isRotaPrincipal && (
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Voltar"
              className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary hover:bg-surface-raised hover:text-text-primary lg:hidden"
            >
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
          )}
          <Link href="/cliente" className="flex items-center gap-2">
            <LogoMark size="sm" />
            <span className="font-heading text-sm font-bold text-text-primary">{NOME_BARBEARIA}</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = href === '/cliente' ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-accent-muted text-accent'
                    : 'text-text-secondary hover:bg-surface-raised hover:text-text-primary',
                )}
              >
                <Icon size={16} aria-hidden="true" />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <UserButton />
          <ThemeToggle />
          <SairButton redirectUrl="/entrar/cliente" />
        </div>
      </div>
    </header>
  )
}
