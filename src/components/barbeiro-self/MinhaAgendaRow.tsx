import { CheckCircle2, CornerDownRight } from 'lucide-react'
import type { Agendamento, Assinatura, Barbeiro, Cliente, PlanoAssinatura, Servico } from '../../types'
import { StatusPill } from '../../components/ui'
import { TipoAtendimentoBadge } from '../agenda/TipoAtendimentoBadge'
import { RegistrarAtendimentoModal } from './RegistrarAtendimentoModal'
import { BloquearMeuHorarioButton } from './BloquearMeuHorarioButton'
import { MeuNaoCompareceuButton } from './MeuNaoCompareceuButton'
import { CancelarMeuAgendamentoButton } from './CancelarMeuAgendamentoButton'
import { getTipoAtendimento } from '../../lib/derive'

export function MinhaAgendaRow({
  agendamento,
  clientes,
  servicos,
  planos,
  assinaturas,
  barbeiros,
}: {
  agendamento: Agendamento
  clientes: Cliente[]
  servicos: Servico[]
  planos: PlanoAssinatura[]
  assinaturas: Assinatura[]
  barbeiros: Barbeiro[]
}) {
  if (agendamento.continuacaoDeId) {
    return (
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3 text-text-secondary last:border-b-0">
        <span className="mono-value shrink-0 text-sm">{agendamento.hora}</span>
        <CornerDownRight size={14} className="shrink-0" aria-hidden="true" />
        <span className="text-xs">continuação do horário anterior</span>
      </div>
    )
  }

  const cliente = agendamento.clienteId ? clientes.find((c) => c.id === agendamento.clienteId) : undefined
  const servicosDoAgendamento = agendamento.servicoIds
    .map((id) => servicos.find((s) => s.id === id))
    .filter((s): s is Servico => Boolean(s))
  const tipo = cliente ? getTipoAtendimento(agendamento.servicoIds, cliente.id, planos, assinaturas) : null

  return (
    <div className="flex flex-col gap-2 border-b border-border px-4 py-3 last:border-b-0">
      <div className="flex items-center justify-between gap-2">
        <span className="mono-value shrink-0 text-sm text-text-primary">{agendamento.hora}</span>
        <div className="flex shrink-0 items-center gap-2">
          <StatusPill status={agendamento.status} />
          {agendamento.status === 'atendido' && (
            <span className="flex items-center gap-1 text-xs text-status-green">
              <CheckCircle2 size={14} aria-hidden="true" />
              Registrado
            </span>
          )}
          {(agendamento.status === 'livre' || agendamento.status === 'bloqueado') && (
            <BloquearMeuHorarioButton
              data={agendamento.data}
              hora={agendamento.hora}
              bloqueado={agendamento.status === 'bloqueado'}
            />
          )}
          {agendamento.status === 'confirmado' && cliente && (
            <MeuNaoCompareceuButton agendamentoId={agendamento.id} clienteNome={cliente.nome} />
          )}
          {(agendamento.status === 'confirmado' || agendamento.status === 'nao_compareceu') && cliente && (
            <CancelarMeuAgendamentoButton agendamentoId={agendamento.id} clienteNome={cliente.nome} />
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="break-words text-sm text-text-primary">{cliente?.nome ?? '—'}</span>
        {servicosDoAgendamento.length > 0 && (
          <span className="break-words text-xs text-text-secondary">
            {servicosDoAgendamento.map((s) => s.nome).join(' + ')}
          </span>
        )}
        {tipo && <TipoAtendimentoBadge tipo={tipo} />}
      </div>
      {agendamento.status === 'confirmado' && cliente && servicosDoAgendamento.length > 0 && (
        <RegistrarAtendimentoModal
          agendamentoId={agendamento.id}
          clienteId={cliente.id}
          clienteNome={cliente.nome}
          servicoNomes={servicosDoAgendamento.map((s) => s.nome)}
          ehAvulso={tipo === 'avulso'}
          barbeiros={barbeiros}
        />
      )}
    </div>
  )
}
