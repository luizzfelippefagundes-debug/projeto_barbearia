import { redirect } from 'next/navigation'
import { Sidebar } from '../../../components/admin/Sidebar'
import { requireAdminAccess } from '../../../lib/adminAuth'
import { getBarbeariaPorId } from '../../../db/queries/barbearias'
import { getLogoBarbearia } from '../../../lib/logoBarbearia'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const dono = await requireAdminAccess()
  const barbearia = await getBarbeariaPorId(dono.barbeariaId)
  if (barbearia?.statusPagamento === 'atrasado') redirect('/pagamento-pendente')

  return (
    <div className="flex h-dvh flex-col bg-bg lg:flex-row">
      <Sidebar
        nome={dono.nome}
        barbeariaNome={barbearia?.nome ?? 'Minha barbearia'}
        logoSrc={getLogoBarbearia(barbearia?.slug)}
      />
      <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-4 py-6 sm:px-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  )
}
