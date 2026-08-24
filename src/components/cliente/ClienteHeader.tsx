'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { UserButton } from '@clerk/nextjs'
import { NOME_BARBEARIA } from '../../lib/constants'
import { LogoMark } from '../ui/LogoMark'
import { SairButton } from '../auth/SairButton'
import { ThemeToggle } from '../theme/ThemeToggle'

const ROTAS_PRINCIPAIS = ['/cliente', '/cliente/agendar', '/cliente/assinar', '/cliente/perfil']

export function ClienteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const isRotaPrincipal = ROTAS_PRINCIPAIS.includes(pathname)

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <div className="flex items-center gap-1">
          {!isRotaPrincipal && (
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Voltar"
              className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary hover:bg-surface-raised hover:text-text-primary"
            >
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
          )}
          <Link href="/cliente" className="flex items-center gap-2">
            <LogoMark size="sm" />
            <span className="font-heading text-sm font-bold text-text-primary">{NOME_BARBEARIA}</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <UserButton />
          <ThemeToggle />
          <SairButton redirectUrl="/entrar/cliente" />
        </div>
      </div>
    </header>
  )
}
