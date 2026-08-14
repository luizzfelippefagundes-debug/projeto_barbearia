import { useParams } from 'react-router-dom'
import { ThumbsDown, ThumbsUp } from 'lucide-react'
import { Button, Card, EmptyState } from '../../../components/ui'
import { useAppData } from '../../../state/useAppData'
import { CLIENTE_ATUAL_ID } from '../../../lib/constants'
import { formatDataCurta } from '../../../lib/format'

export function PostVisitRating() {
  const { agendamentoId } = useParams()
  const { state, dispatch } = useAppData()

  const cliente = state.clientes.find((c) => c.id === CLIENTE_ATUAL_ID)
  if (!cliente) return null

  const visita =
    cliente.historico.find((h) => h.id === agendamentoId) ??
    [...cliente.historico].sort((a, b) => b.data.localeCompare(a.data))[0]

  if (!visita) {
    return <EmptyState title="Nada para avaliar" description="Você ainda não teve nenhum atendimento." />
  }

  const barbeiro = state.barbeiros.find((b) => b.id === visita.barbeiroId)
  const servico = state.servicos.find((s) => s.id === visita.servicoId)

  if (visita.avaliacao) {
    return (
      <Card className="flex flex-col items-center gap-2 p-8 text-center">
        <p className="text-lg text-text-primary">Obrigado pela avaliação!</p>
        <p className="text-sm text-text-secondary">Isso ajuda a melhorar o atendimento.</p>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col items-center gap-4 p-8 text-center">
      <div>
        <p className="text-lg text-text-primary">Como foi o seu corte?</p>
        <p className="text-sm text-text-secondary">
          {servico?.nome} com {barbeiro?.nome} · {formatDataCurta(visita.data)}
        </p>
      </div>
      <div className="flex gap-4">
        <Button
          size="lg"
          variant="secondary"
          onClick={() =>
            dispatch({ type: 'RATE_VISITA', clienteId: cliente.id, historicoId: visita.id, rating: 'up' })
          }
        >
          <ThumbsUp size={22} aria-hidden="true" />
        </Button>
        <Button
          size="lg"
          variant="ghost"
          onClick={() =>
            dispatch({ type: 'RATE_VISITA', clienteId: cliente.id, historicoId: visita.id, rating: 'down' })
          }
        >
          <ThumbsDown size={22} aria-hidden="true" />
        </Button>
      </div>
    </Card>
  )
}
