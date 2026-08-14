import { UserX } from 'lucide-react'
import { Card, EmptyState, SectionHeading } from '../../components/ui'
import { useAppData } from '../../state/useAppData'
import { getClientesSumindo } from '../../lib/derive'
import { HOJE_ISO } from '../../lib/dateUtils'
import { CLIENTE_SUMINDO_DIAS } from '../../lib/constants'

export function ClientesSumindoAlert() {
  const { state } = useAppData()
  const sumindo = getClientesSumindo(state.clientes, HOJE_ISO, CLIENTE_SUMINDO_DIAS)

  return (
    <div>
      <SectionHeading>Clientes sumindo</SectionHeading>
      {sumindo.length === 0 ? (
        <EmptyState
          title="Nenhum cliente sumindo"
          description={`Todos voltaram em menos de ${CLIENTE_SUMINDO_DIAS} dias.`}
        />
      ) : (
        <Card className="border-status-amber bg-status-amber-muted">
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
