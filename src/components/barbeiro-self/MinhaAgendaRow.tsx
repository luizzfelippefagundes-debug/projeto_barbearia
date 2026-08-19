import { CheckCircle2 } from 'lucide-react'
import type { Agendamento, Cliente, Servico } from '../../types'
import { StatusPill } from '../../components/ui'
import { RegistrarAtendimentoModal } from './RegistrarAtendimentoModal'

export function MinhaAgendaRow({
  agendamento,
  clientes,
  servicos,
}: {
  agendamento: Agendamento
  clientes: Cliente[]
  servicos: Servico[]
}) {
  const cliente = agendamento.clienteId ? clientes.find((c) => c.id === agendamento.clienteId) : undefined
  const servico = agendamento.servicoId ? servicos.find((s) => s.id === agendamento.servicoId) : undefined

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-b-0">
      <div className="flex items-center gap-4">
        <span className="mono-value w-14 text-sm text-text-primary">{agendamento.hora}</span>
        <span className="text-sm text-text-primary">{cliente?.nome ?? '—'}</span>
        {servico && <span className="text-xs text-text-secondary">{servico.nome}</span>}
      </div>
      <div className="flex items-center gap-3">
        <StatusPill status={agendamento.status} />
        {agendamento.status === 'confirmado' && cliente && servico && (
          <RegistrarAtendimentoModal
            agendamentoId={agendamento.id}
            clienteId={cliente.id}
            clienteNome={cliente.nome}
            servicoId={servico.id}
            servicoNome={servico.nome}
          />
        )}
        {agendamento.status === 'atendido' && (
          <span className="flex items-center gap-1 text-xs text-status-green">
            <CheckCircle2 size={14} aria-hidden="true" />
            Registrado
          </span>
        )}
      </div>
    </div>
  )
}
