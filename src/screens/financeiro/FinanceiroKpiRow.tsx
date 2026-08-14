import { Card } from '../../components/ui'
import { useAppData } from '../../state/useAppData'
import {
  getAssinantesEmDia,
  getFaturamentoGeradoPorBarbeiroNoMes,
  getFrequenciaRetornoDias,
  getMRR,
  getTicketMedio,
  getValorAReceber,
} from '../../lib/derive'
import { formatBRL } from '../../lib/format'
import { HOJE_ISO } from '../../lib/dateUtils'

const MES_REFERENCIA = HOJE_ISO.slice(0, 7)

export function FinanceiroKpiRow() {
  const { state } = useAppData()

  const mrr = getMRR(state.assinaturas, state.planosAssinatura)
  const assinantesEmDia = getAssinantesEmDia(state.assinaturas)

  const totalComissoes = state.barbeiros.reduce((total, barbeiro) => {
    const faturamento = getFaturamentoGeradoPorBarbeiroNoMes(
      state.agendamentos,
      state.servicos,
      barbeiro.id,
      MES_REFERENCIA,
    )
    return total + getValorAReceber(barbeiro, faturamento)
  }, 0)

  const margemLiquidaPorAssinante =
    assinantesEmDia > 0 ? (mrr - totalComissoes) / assinantesEmDia : 0

  const ticketMedio = getTicketMedio(state.agendamentos, state.servicos, MES_REFERENCIA)

  const frequencias = state.clientes
    .map((c) => getFrequenciaRetornoDias(c))
    .filter((v): v is number => v !== null)
  const frequenciaMedia =
    frequencias.length > 0
      ? Math.round(frequencias.reduce((a, b) => a + b, 0) / frequencias.length)
      : null

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card className="p-4">
        <p className="text-xs text-text-secondary">Margem líquida por assinante</p>
        <p className="mono-value mt-1 text-2xl text-text-primary">{formatBRL(margemLiquidaPorAssinante)}</p>
      </Card>
      <Card className="p-4">
        <p className="text-xs text-text-secondary">Ticket médio</p>
        <p className="mono-value mt-1 text-2xl text-text-primary">{formatBRL(ticketMedio)}</p>
      </Card>
      <Card className="p-4">
        <p className="text-xs text-text-secondary">Frequência de retorno</p>
        <p className="mono-value mt-1 text-2xl text-text-primary">
          {frequenciaMedia !== null ? `${frequenciaMedia} dias` : '—'}
        </p>
      </Card>
    </div>
  )
}
