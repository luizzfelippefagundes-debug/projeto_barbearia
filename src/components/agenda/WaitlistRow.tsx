'use client'

import { useTransition } from 'react'
import { BellRing, Check } from 'lucide-react'
import type { Barbeiro, Cliente, FilaEsperaEntry, Servico } from '../../types'
import { Button } from '../../components/ui'
import { notificarFila } from '../../actions/agenda.actions'

interface WaitlistRowProps {
  entrada: FilaEsperaEntry
  clientes: Cliente[]
  barbeiros: Barbeiro[]
  servicos: Servico[]
}

export function WaitlistRow({ entrada, clientes, barbeiros, servicos }: WaitlistRowProps) {
  const [pending, startTransition] = useTransition()

  const cliente = clientes.find((c) => c.id === entrada.clienteId)
  const barbeiroDesejado = entrada.desejaBarbeiroId
    ? barbeiros.find((b) => b.id === entrada.desejaBarbeiroId)
    : undefined
  const servicoDesejado = entrada.desejaServicoId
    ? servicos.find((s) => s.id === entrada.desejaServicoId)
    : undefined

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2.5 last:border-b-0">
      <div>
        <p className="text-sm text-text-primary">{cliente?.nome}</p>
        <p className="text-xs text-text-secondary">
          {barbeiroDesejado ? barbeiroDesejado.nome : 'Qualquer barbeiro'}
          {servicoDesejado ? ` · ${servicoDesejado.nome}` : ''}
        </p>
      </div>

      {entrada.notificado ? (
        <span className="flex items-center gap-1.5 text-xs text-status-green">
          <Check size={14} aria-hidden="true" /> Notificado
        </span>
      ) : (
        <Button
          size="sm"
          variant="secondary"
          disabled={pending}
          onClick={() => startTransition(() => notificarFila(entrada.id))}
        >
          <BellRing size={14} aria-hidden="true" />
          Notificar
        </Button>
      )}
    </div>
  )
}
