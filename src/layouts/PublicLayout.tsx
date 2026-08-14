import { Link, Outlet } from 'react-router-dom'
import { Scissors, User } from 'lucide-react'
import { NOME_BARBEARIA } from '../lib/constants'

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <header className="sticky top-0 z-10 border-b border-border bg-surface">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <Link to="/cliente" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-accent text-accent">
              <Scissors size={16} aria-hidden="true" />
            </span>
            <span className="font-heading text-sm tracking-wide uppercase">{NOME_BARBEARIA}</span>
          </Link>
          <Link
            to="/cliente/perfil"
            aria-label="Meu perfil"
            className="flex h-9 w-9 items-center justify-center rounded border border-border text-text-secondary hover:border-brass hover:text-brass"
          >
            <User size={18} aria-hidden="true" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-5">
        <Outlet />
      </main>
    </div>
  )
}
