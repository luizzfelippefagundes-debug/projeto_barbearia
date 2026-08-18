import Link from 'next/link'
import { Scissors } from 'lucide-react'
import { UserButton } from '@clerk/nextjs'
import { NOME_BARBEARIA } from '../../lib/constants'
import { SairButton } from '../../components/auth/SairButton'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <header className="sticky top-0 z-10 border-b border-border bg-surface">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <Link href="/cliente" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-white">
              <Scissors size={16} aria-hidden="true" />
            </span>
            <span className="font-heading text-sm font-bold text-text-primary">{NOME_BARBEARIA}</span>
          </Link>
          <div className="flex items-center gap-2">
            <UserButton />
            <SairButton redirectUrl="/entrar/cliente" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-5">{children}</main>
    </div>
  )
}
