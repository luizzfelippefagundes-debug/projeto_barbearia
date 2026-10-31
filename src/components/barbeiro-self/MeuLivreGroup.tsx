'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { Agendamento, Assinatura, Barbeiro, Cliente, PlanoAssinatura, Servico } from '../../types'
import { MinhaAgendaRow } from './MinhaAgendaRow'

export function MeuLivreGroup({
  agendamentos,
  clientes,
  servicos,
  planos,
  assinaturas,
  barbeiros,
}: {
  agendamentos: Agendamento[]
  clientes: Cliente[]
  servicos: Servico[]
  planos: PlanoAssinatura[]
  assinaturas: Assinatura[]
  barbeiros: Barbeiro[]
}) {
  const [aberto, setAberto] = useState(false)

  if (agendamentos.length === 1) {
    return (
      <MinhaAgendaRow
        agendamento={agendamentos[0]}
        clientes={clientes}
        servicos={servicos}
        planos={planos}
        assinaturas={assinaturas}
        barbeiros={barbeiros}
      />
    )
  }

  const primeiro = agendamentos[0].hora
  const ultimo = agendamentos[agendamentos.length - 1].hora

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        className="flex w-full items-center gap-2 border-l-2 border-l-transparent px-4 py-2.5 text-left text-sm text-text-secondary hover:bg-surface-hover"
      >
        {aberto ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span className="mono-value">{primeiro} – {ultimo}</span>
        <span className="text-xs">
          {agendamentos.length} horários livres
        </span>
      </button>
      {aberto &&
        agendamentos.map((a) => (
          <MinhaAgendaRow
            key={a.id}
            agendamento={a}
            clientes={clientes}
            servicos={servicos}
            planos={planos}
            assinaturas={assinaturas}
            barbeiros={barbeiros}
          />
        ))}
    </div>
  )
}
