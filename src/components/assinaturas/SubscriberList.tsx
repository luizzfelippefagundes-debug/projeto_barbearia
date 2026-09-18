'use client'

import { useState } from 'react'
import type { Assinatura, Cliente, PlanoAssinatura, StatusPagamento } from '../../types'
import { Card, EmptyState } from '../../components/ui'
import { SubscriberRow } from './SubscriberRow'
import { cn } from '../../lib/cn'

const FILTROS: { id: StatusPagamento | 'todos'; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'em_dia', label: 'Em dia' },
  { id: 'atrasado', label: 'Atrasado' },
  { id: 'cancelado', label: 'Cancelado' },
]

export function SubscriberList({
  assinaturas,
  clientes,
  planos,
}: {
  assinaturas: Assinatura[]
  clientes: Cliente[]
  planos: PlanoAssinatura[]
}) {
  const [filtro, setFiltro] = useState<StatusPagamento | 'todos'>('todos')

  if (assinaturas.length === 0) {
    return <EmptyState title="Nenhum assinante" description="Ainda não há assinaturas cadastradas." />
  }

  const filtradas = filtro === 'todos' ? assinaturas : assinaturas.filter((a) => a.status === filtro)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTROS.map((f) => {
          const ativo = f.id === filtro
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFiltro(f.id)}
              className={cn(
                'shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                ativo
                  ? 'border-accent bg-accent text-white'
                  : 'border-border bg-surface text-text-secondary hover:border-accent hover:text-text-primary',
              )}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {filtradas.length === 0 ? (
        <EmptyState title="Nenhum assinante" description="Ninguém com esse status no momento." />
      ) : (
        <Card className="max-h-[26rem] overflow-y-auto">
          {filtradas.map((assinatura) => (
            <SubscriberRow
              key={assinatura.id}
              assinatura={assinatura}
              cliente={clientes.find((c) => c.id === assinatura.clienteId)}
              plano={planos.find((p) => p.id === assinatura.planoId)}
            />
          ))}
        </Card>
      )}
    </div>
  )
}
