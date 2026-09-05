import { CornerDownRight } from 'lucide-react'
import type { Agendamento, Assinatura, Barbeiro, Cliente, PlanoAssinatura, Servico } from '../../types'
import { StatusPill } from '../../components/ui'
import { BloquearHorarioButton } from './BloquearHorarioButton'
import { CancelarAgendamentoButton } from './CancelarAgendamentoButton'
import { EditarServicosButton } from './EditarServicosButton'
import { NaoCompareceuButton } from './NaoCompareceuButton'
import { RegistrarAtendimentoAdminModal } from './RegistrarAtendimentoAdminModal'
import { TipoAtendimentoBadge } from './TipoAtendimentoBadge'
import { getStatusVisual } from '../../lib/statusMap'
import { getTipoAtendimento } from '../../lib/derive'
import { cn } from '../../lib/cn'

interface ScheduleRowProps {
  agendamento: Agendamento
  barbeiros: Barbeiro[]
  clientes: Cliente[]
  servicos: Servico[]
  planos: PlanoAssinatura[]
  assinaturas: Assinatura[]
  mostrarBarbeiro?: boolean
}

export function ScheduleRow({
  agendamento,
  barbeiros,
  clientes,
  servicos,
  planos,
  assinaturas,
  mostrarBarbeiro = true,
}: ScheduleRowProps) {
  const barbeiro = barbeiros.find((b) => b.id === agendamento.barbeiroId)

  if (agendamento.continuacaoDeId) {
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-l-2 border-b border-border border-l-transparent px-4 py-2.5 text-text-secondary last:border-b-0">
        <span className="mono-value shrink-0 text-sm">{agendamento.hora}</span>
        {mostrarBarbeiro && <span className="shrink-0 text-xs">{barbeiro?.nome}</span>}
        <span className="flex min-w-0 items-center gap-1 text-xs">
          <CornerDownRight size={14} className="shrink-0" aria-hidden="true" />
          continuação do horário anterior
        </span>
      </div>
    )
  }

  const cliente = agendamento.clienteId ? clientes.find((c) => c.id === agendamento.clienteId) : undefined
  const servicosDoAgendamento = agendamento.servicoIds
    .map((id) => servicos.find((s) => s.id === id))
    .filter((s): s is Servico => Boolean(s))

  const tipo = cliente ? getTipoAtendimento(agendamento.servicoIds, cliente.id, planos, assinaturas) : null

  const visual = getStatusVisual(agendamento.status)
  const ocupado =
    agendamento.status === 'bloqueado' ||
    agendamento.status === 'confirmado' ||
    agendamento.status === 'atendido' ||
    agendamento.status === 'nao_compareceu'

  return (
    <div
      className={cn(
        'flex flex-col gap-1.5 border-l-2 border-b border-border px-4 py-3 last:border-b-0',
        ocupado ? visual.border : 'border-l-transparent',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="mono-value shrink-0 text-sm text-text-primary">{agendamento.hora}</span>
          {mostrarBarbeiro && <span className="truncate text-xs text-text-secondary">{barbeiro?.nome}</span>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <StatusPill status={agendamento.status} />
          {(agendamento.status === 'livre' || agendamento.status === 'bloqueado') && (
            <BloquearHorarioButton
              data={agendamento.data}
              hora={agendamento.hora}
              barbeiroId={agendamento.barbeiroId}
              bloqueado={agendamento.status === 'bloqueado'}
            />
          )}
          {agendamento.status === 'confirmado' && cliente && servicosDoAgendamento.length > 0 && (
            <EditarServicosButton
              agendamentoId={agendamento.id}
              servicos={servicos}
              servicoIdsAtuais={agendamento.servicoIds}
            />
          )}
          {agendamento.status === 'confirmado' && cliente && (
            <NaoCompareceuButton agendamentoId={agendamento.id} clienteNome={cliente.nome} />
          )}
          {(agendamento.status === 'confirmado' || agendamento.status === 'nao_compareceu') && cliente && (
            <CancelarAgendamentoButton agendamentoId={agendamento.id} clienteNome={cliente.nome} />
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="break-words text-sm text-text-primary">
          {cliente
            ? cliente.nome
            : agendamento.status === 'bloqueado'
              ? 'Horário bloqueado'
              : agendamento.status === 'aguardando'
                ? 'Aguardando confirmação'
                : '—'}
        </span>
        {servicosDoAgendamento.length > 0 && (
          <span className="break-words text-xs text-text-secondary">
            {servicosDoAgendamento.map((s) => s.nome).join(' + ')}
          </span>
        )}
        {tipo && <TipoAtendimentoBadge tipo={tipo} />}
      </div>
      {agendamento.status === 'confirmado' && cliente && servicosDoAgendamento.length > 0 && (
        <RegistrarAtendimentoAdminModal
          agendamentoId={agendamento.id}
          clienteId={cliente.id}
          clienteNome={cliente.nome}
          servicoNomes={servicosDoAgendamento.map((s) => s.nome)}
          ehAvulso={tipo === 'avulso'}
          barbeiros={barbeiros}
          barbeiroDoAgendamentoId={agendamento.barbeiroId}
        />
      )}
    </div>
  )
}
