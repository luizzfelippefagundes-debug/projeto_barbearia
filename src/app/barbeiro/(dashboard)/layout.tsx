import { BarbeiroSidebar } from '../../../components/barbeiro-self/BarbeiroSidebar'
import { requireBarbeiroAccess } from '../../../lib/barbeiroAuth'

export default async function BarbeiroDashboardLayout({ children }: { children: React.ReactNode }) {
  const barbeiro = await requireBarbeiroAccess()

  return (
    <div className="flex h-screen flex-col bg-bg lg:flex-row">
      <BarbeiroSidebar nome={barbeiro.nome} ehDono={barbeiro.papel === 'dono'} />
      <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-4 py-6 sm:px-8">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>
    </div>
  )
}
