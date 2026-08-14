import type { Agendamento } from '../../types'
import { StatusPill } from '../../components/ui'
import { useAppData } from '../../state/useAppData'
import { getStatusVisual } from '../../lib/statusMap'
import { cn } from '../../lib/cn'

export function ScheduleRow({ agendamento }: { agendamento: Agendamento }) {
  const { state } = useAppData()

  const barbeiro = state.barbeiros.find((b) => b.id === agendamento.barbeiroId)
  const cliente = agendamento.clienteId
    ? state.clientes.find((c) => c.id === agendamento.clienteId)
    : undefined
  const servico = agendamento.servicoId
    ? state.servicos.find((s) => s.id === agendamento.servicoId)
    : undefined

  const visual = getStatusVisual(agendamento.status)
  const ocupado = agendamento.status === 'bloqueado' || agendamento.status === 'confirmado'

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-2 border-l-2 border-b border-border px-4 py-2.5 last:border-b-0',
        ocupado ? visual.border : 'border-l-transparent',
      )}
    >
      <div className="flex items-center gap-4">
        <span className="mono-value w-14 text-sm text-text-primary">{agendamento.hora}</span>
        <span className="w-28 shrink-0 text-xs text-text-secondary">{barbeiro?.nome}</span>
        <span className="text-sm text-text-primary">
          {cliente
            ? cliente.nome
            : agendamento.status === 'bloqueado'
              ? 'Horário bloqueado'
              : agendamento.status === 'aguardando'
                ? 'Aguardando confirmação'
                : '—'}
        </span>
        {servico && <span className="text-xs text-text-secondary">{servico.nome}</span>}
      </div>
      <StatusPill status={agendamento.status} />
    </div>
  )
}
