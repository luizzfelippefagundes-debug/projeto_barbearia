import { ThumbsDown, ThumbsUp } from 'lucide-react'
import type { HaircutRecord } from '../../types'
import { EmptyState } from '../../components/ui'
import { useAppData } from '../../state/useAppData'
import { formatDataCurta } from '../../lib/format'

export function ClienteVisitHistory({ historico }: { historico: HaircutRecord[] }) {
  const { state } = useAppData()

  if (historico.length === 0) {
    return <EmptyState title="Sem histórico" description="Este cliente ainda não teve atendimentos." />
  }

  const ordenado = [...historico].sort((a, b) => b.data.localeCompare(a.data))

  return (
    <ul className="flex flex-col gap-3">
      {ordenado.map((h) => {
        const barbeiro = state.barbeiros.find((b) => b.id === h.barbeiroId)
        const servico = state.servicos.find((s) => s.id === h.servicoId)
        return (
          <li key={h.id} className="border-b border-border pb-3 last:border-b-0">
            <div className="flex items-center justify-between">
              <span className="mono-value text-xs text-text-secondary">{formatDataCurta(h.data)}</span>
              {h.avaliacao === 'up' && <ThumbsUp size={14} className="text-status-green" aria-label="Avaliação positiva" />}
              {h.avaliacao === 'down' && <ThumbsDown size={14} className="text-status-red" aria-label="Avaliação negativa" />}
            </div>
            <p className="text-sm text-text-primary">
              {servico?.nome} · {barbeiro?.nome}
            </p>
            {h.notas && <p className="mt-1 text-xs text-text-secondary">{h.notas}</p>}
          </li>
        )
      })}
    </ul>
  )
}
