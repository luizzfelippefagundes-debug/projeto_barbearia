import { redirect } from 'next/navigation'
import { EmptyState } from '../../../components/ui'
import { PlanoCard } from '../../../components/assinar/PlanoCard'
import { requireClienteAtual } from '../../../lib/clienteAuth'
import { getAssinaturaAtivaDoCliente, getPlanosAssinatura } from '../../../db/queries/assinaturas'

export default async function AssinarPage() {
  const cliente = await requireClienteAtual()

  const ativa = await getAssinaturaAtivaDoCliente(cliente.id)
  if (ativa) redirect('/cliente/perfil')

  const planos = await getPlanosAssinatura()

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg text-text-primary">Assinar um plano</h1>
        <p className="text-sm text-text-secondary">Pague menos por corte e economize todo mês.</p>
      </div>

      {planos.length === 0 ? (
        <EmptyState title="Nenhum plano disponível" description="A barbearia ainda não cadastrou planos." />
      ) : (
        <div className="flex flex-col gap-3">
          {planos.map((plano) => (
            <PlanoCard key={plano.id} plano={plano} cpfAtual={cliente.cpfCnpj} />
          ))}
        </div>
      )}
    </div>
  )
}
