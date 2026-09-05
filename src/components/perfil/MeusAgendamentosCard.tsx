'use client'

import { useState, useTransition } from 'react'
import { CalendarClock, X } from 'lucide-react'
import type { Agendamento, Barbeiro, Servico } from '../../types'
import { Card, ConfirmDialog, EmptyState, IconButton } from '../../components/ui'
import { cancelarMeuAgendamento } from '../../actions/booking.actions'
import { formatDateDisplay, getHojeISO } from '../../lib/dateUtils'

function LinhaAgendamento({
  agendamento,
  barbeiros,
  servicos,
}: {
  agendamento: Agendamento
  barbeiros: Barbeiro[]
  servicos: Servico[]
}) {
  const [confirmar, setConfirmar] = useState(false)
  const [pending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)

  const barbeiro = barbeiros.find((b) => b.id === agendamento.barbeiroId)
  const nomesServicos = agendamento.servicoIds
    .map((id) => servicos.find((s) => s.id === id)?.nome)
    .filter(Boolean)
    .join(' + ')
  const hoje = getHojeISO()

  function handleCancelar() {
    setErro(null)
    startTransition(async () => {
      try {
        await cancelarMeuAgendamento(agendamento.id)
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'Não foi possível cancelar.')
      }
    })
  }

  return (
    <div className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="truncate text-sm text-text-primary">{nomesServicos}</p>
        <p className="text-xs text-text-secondary">
          {agendamento.data === hoje ? 'Hoje' : formatDateDisplay(agendamento.data)} às {agendamento.hora} ·{' '}
          {barbeiro?.nome}
        </p>
        {erro && <p className="text-xs text-status-red">{erro}</p>}
      </div>
      <IconButton
        icon={<X size={14} aria-hidden="true" />}
        label="Cancelar agendamento"
        disabled={pending}
        onClick={() => setConfirmar(true)}
      />

      <ConfirmDialog
        open={confirmar}
        onClose={() => setConfirmar(false)}
        onConfirm={handleCancelar}
        title="Cancelar agendamento"
        description={`Cancelar seu horário de ${nomesServicos || 'atendimento'} em ${formatDateDisplay(agendamento.data)}?`}
        confirmLabel="Cancelar"
      />
    </div>
  )
}

export function MeusAgendamentosCard({
  agendamentos,
  barbeiros,
  servicos,
}: {
  agendamentos: Agendamento[]
  barbeiros: Barbeiro[]
  servicos: Servico[]
}) {
  if (agendamentos.length === 0) {
    return (
      <EmptyState
        icon={<CalendarClock size={22} />}
        title="Nenhum agendamento"
        description="Você ainda não tem um horário marcado."
      />
    )
  }

  return (
    <Card className="p-4">
      <div className="mb-1 flex items-center gap-2 text-brass">
        <CalendarClock size={18} aria-hidden="true" />
        <span className="text-xs tracking-wide uppercase">Meus agendamentos</span>
      </div>
      <div className="flex flex-col">
        {agendamentos.map((a) => (
          <LinhaAgendamento key={a.id} agendamento={a} barbeiros={barbeiros} servicos={servicos} />
        ))}
      </div>
    </Card>
  )
}
