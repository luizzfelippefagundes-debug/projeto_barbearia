import { Clock } from 'lucide-react'
import type { Barbeiro, PayoutBarbeiro } from '../../types'
import { Avatar, Card, StatusPill } from '../../components/ui'
import { CommissionSlider } from './CommissionSlider'
import { PayoutStatusPill } from './PayoutStatusPill'
import { formatBRL } from '../../lib/format'

interface BarbeiroCardProps {
  barbeiro: Barbeiro
  payout: PayoutBarbeiro | undefined
  cortes: number
  valorAReceber: number
}

export function BarbeiroCard({ barbeiro, payout, cortes, valorAReceber }: BarbeiroCardProps) {
  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-center gap-3">
        <Avatar nome={barbeiro.nome} size="lg" />
        <div>
          <h3 className="text-base text-text-primary">{barbeiro.nome}</h3>
          <p className="text-xs text-text-secondary">{cortes} cortes este mês</p>
        </div>
      </div>

      {barbeiro.convitePendente && (
        <StatusPill
          status="aguardando"
          label={
            <span className="flex items-center gap-1">
              <Clock size={12} aria-hidden="true" /> Aguardando primeiro login
            </span>
          }
        />
      )}

      <CommissionSlider barbeiroId={barbeiro.id} value={barbeiro.comissaoPercent} />

      <div className="divider-thin" />

      <div className="flex flex-col gap-3">
        <div>
          <p className="text-xs text-text-secondary">Valor a receber</p>
          <p className="mono-value text-xl text-text-primary">{formatBRL(valorAReceber)}</p>
        </div>
        <PayoutStatusPill payout={payout} />
      </div>
    </Card>
  )
}
