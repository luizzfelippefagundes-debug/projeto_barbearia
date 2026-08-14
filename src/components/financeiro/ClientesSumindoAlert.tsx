import { UserX } from 'lucide-react'
import type { Cliente } from '../../types'
import { Card, EmptyState, SectionHeading } from '../../components/ui'
import { getClientesSumindo } from '../../lib/derive'
import { getHojeISO } from '../../lib/dateUtils'
import { CLIENTE_SUMINDO_DIAS } from '../../lib/constants'

export function ClientesSumindoAlert({ clientes }: { clientes: Cliente[] }) {
  const sumindo = getClientesSumindo(clientes, getHojeISO(), CLIENTE_SUMINDO_DIAS)

  return (
    <div>
      <SectionHeading>Clientes sumindo</SectionHeading>
      {sumindo.length === 0 ? (
        <EmptyState
          title="Nenhum cliente sumindo"
          description={`Todos voltaram em menos de ${CLIENTE_SUMINDO_DIAS} dias (ou ainda não há histórico suficiente).`}
        />
      ) : (
        <Card className="border-status-amber/30 bg-status-amber-muted">
          {sumindo.map(({ cliente, diasSemVisita }) => (
            <div
              key={cliente.id}
              className="flex items-center justify-between border-b border-status-amber/30 px-4 py-3 last:border-b-0"
            >
              <span className="flex items-center gap-2 text-sm text-text-primary">
                <UserX size={14} className="text-status-amber" aria-hidden="true" />
                {cliente.nome}
              </span>
              <span className="mono-value text-xs text-status-amber">{diasSemVisita} dias sem visita</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
