import { EmptyState } from '../../../../components/ui'
import { PostVisitRatingClient } from '../../../../components/rating/PostVisitRatingClient'
import { requireClienteAtual } from '../../../../lib/clienteAuth'
import { getBarbeiros } from '../../../../db/queries/barbeiros'
import { getServicosAtivos } from '../../../../db/queries/servicos'

export default async function AvaliarPage({
  params,
}: {
  params: Promise<{ historicoId: string }>
}) {
  const { historicoId } = await params
  const cliente = await requireClienteAtual()

  const visita =
    cliente.historico.find((h) => h.id === historicoId) ??
    [...cliente.historico].sort((a, b) => b.data.localeCompare(a.data))[0]

  if (!visita) {
    return <EmptyState title="Nada para avaliar" description="Você ainda não teve nenhum atendimento." />
  }

  const [barbeiros, servicos] = await Promise.all([getBarbeiros(), getServicosAtivos()])

  return (
    <div className="lg:mx-auto lg:max-w-3xl">
      <PostVisitRatingClient
        visita={visita}
        barbeiro={barbeiros.find((b) => b.id === visita.barbeiroId)}
        servico={servicos.find((s) => s.id === visita.servicoId)}
      />
    </div>
  )
}
