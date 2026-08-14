import type { PayoutBarbeiro } from '../../types'
import { StatusPill } from '../../components/ui'
import { formatDataCurta } from '../../lib/format'

export function PayoutStatusPill({ payout }: { payout: PayoutBarbeiro | undefined }) {
  if (!payout) return <StatusPill status="pendente" label="Sem repasse no mês" />

  return (
    <div className="flex flex-col gap-1">
      <StatusPill status={payout.status} />
      <span className="text-xs text-text-secondary">
        {payout.status === 'transferido' && payout.dataTransferencia
          ? `Repassado em ${formatDataCurta(payout.dataTransferencia)}`
          : 'Repasse automático pendente'}
      </span>
    </div>
  )
}
