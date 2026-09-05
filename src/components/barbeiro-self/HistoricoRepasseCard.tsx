import type { PayoutBarbeiro } from '../../types'
import { Card, EmptyState, SectionHeading, StatusPill } from '../../components/ui'
import { formatBRL, formatDataCurta } from '../../lib/format'
import { MESES } from '../../lib/dateUtils'

function labelMes(mesReferencia: string): string {
  const [ano, mes] = mesReferencia.split('-').map(Number)
  return `${MESES[mes - 1]} de ${ano}`
}

export function HistoricoRepasseCard({ payouts }: { payouts: PayoutBarbeiro[] }) {
  return (
    <div>
      <SectionHeading>Histórico de repasse</SectionHeading>
      {payouts.length === 0 ? (
        <EmptyState
          title="Nenhum repasse ainda"
          description="Assim que o dono marcar um mês como repassado, ele aparece aqui."
        />
      ) : (
        <Card className="divide-y divide-border p-0">
          {payouts.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm capitalize text-text-primary">{labelMes(p.mesReferencia)}</p>
                {p.status === 'transferido' && p.dataTransferencia && (
                  <p className="text-xs text-text-secondary">Repassado em {formatDataCurta(p.dataTransferencia)}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="mono-value text-sm text-text-primary">{formatBRL(p.valor)}</span>
                <StatusPill status={p.status} />
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
