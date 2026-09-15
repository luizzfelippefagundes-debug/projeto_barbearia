'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { LogoMark } from '../ui/LogoMark'
import { IconButton } from '../ui/IconButton'
import { MobileNavDrawer } from '../ui/MobileNavDrawer'
import { ThemeToggle } from '../theme/ThemeToggle'
import { NOME_PLATAFORMA } from '../../lib/constants'

const NAV_ITEMS = [
  { href: '#inicio', label: 'Início' },
  { href: '#recursos', label: 'Recursos' },
  { href: '#planos', label: 'Planos' },
  { href: '#contato', label: 'Contato' },
]

export function PlanosHeader() {
  const [drawerAberto, setDrawerAberto] = useState(false)

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4">
        <a href="#inicio" className="flex items-center gap-2">
          <LogoMark size="sm" />
          <span className="font-heading text-sm font-bold text-text-primary sm:text-base">{NOME_PLATAFORMA}</span>
        </a>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle className="hidden h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary sm:flex" />
          <Link
            href="/sign-in"
            className="hidden rounded-full px-4 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary lg:inline-block"
          >
            Entrar
          </Link>
          <IconButton
            icon={<Menu size={18} aria-hidden="true" />}
            label="Abrir menu"
            onClick={() => setDrawerAberto(true)}
            className="lg:hidden"
          />
        </div>
      </div>

      <MobileNavDrawer open={drawerAberto} onClose={() => setDrawerAberto(false)}>
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <LogoMark size="sm" />
            <span className="font-heading text-sm font-bold text-text-primary">{NOME_PLATAFORMA}</span>
          </div>
          <IconButton
            icon={<X size={18} aria-hidden="true" />}
            label="Fechar menu"
            onClick={() => setDrawerAberto(false)}
          />
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
          {NAV_ITEMS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={() => setDrawerAberto(false)}
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary"
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2.5 border-t border-border px-4 py-4">
          <Link
            href="/sign-in"
            onClick={() => setDrawerAberto(false)}
            className="flex-1 rounded-full border border-border px-4 py-2 text-center text-sm font-medium text-text-primary transition-colors hover:bg-surface-raised"
          >
            Entrar
          </Link>
          <ThemeToggle />
        </div>
      </MobileNavDrawer>
    </header>
  )
}
