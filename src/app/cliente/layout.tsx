import { ClienteHeader } from '../../components/cliente/ClienteHeader'
import { ClienteBottomNav } from '../../components/cliente/ClienteBottomNav'
import { requireClienteAtual } from '../../lib/clienteAuth'
import { getBarbeariaPorId } from '../../db/queries/barbearias'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const cliente = await requireClienteAtual()
  const barbearia = await getBarbeariaPorId(cliente.barbeariaId)

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <ClienteHeader barbeariaNome={barbearia?.nome ?? 'Minha barbearia'} />

      <main className="mx-auto max-w-md px-4 py-5 pb-24 lg:max-w-5xl lg:pb-10">{children}</main>

      <ClienteBottomNav />
    </div>
  )
}
