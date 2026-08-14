import type { Barbeiro, PayoutBarbeiro } from '../../types'
import { Avatar, Card } from '../../components/ui'
import { CommissionSlider } from './CommissionSlider'
import { PayoutStatusPill } from './PayoutStatusPill'
import { formatBRL } from '../../lib/format'
import { useAppData } from '../../state/useAppData'
import { getCortesNoMesPorBarbeiro, getFaturamentoGeradoPorBarbeiroNoMes, getValorAReceber } from '../../lib/derive'
import { HOJE_ISO } from '../../lib/dateUtils'

interface BarbeiroCardProps {
  barbeiro: Barbeiro
  payout: PayoutBarbeiro | undefined
}

const MES_REFERENCIA = HOJE_ISO.slice(0, 7)

export function BarbeiroCard({ barbeiro, payout }: BarbeiroCardProps) {
  const { state, dispatch } = useAppData()

  const cortes = getCortesNoMesPorBarbeiro(state.agendamentos, barbeiro.id, MES_REFERENCIA)
  const faturamentoGerado = getFaturamentoGeradoPorBarbeiroNoMes(
    state.agendamentos,
    state.servicos,
    barbeiro.id,
    MES_REFERENCIA,
  )
  const valorAReceber = getValorAReceber(barbeiro, faturamentoGerado)

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-center gap-3">
        <Avatar nome={barbeiro.nome} size="lg" />
        <div>
          <h3 className="text-base text-text-primary">{barbeiro.nome}</h3>
          <p className="text-xs text-text-secondary">{cortes} cortes este mês</p>
        </div>
      </div>

      <CommissionSlider
        value={barbeiro.comissaoPercent}
        onChange={(percent) => dispatch({ type: 'SET_COMISSAO', barbeiroId: barbeiro.id, percent })}
      />

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
