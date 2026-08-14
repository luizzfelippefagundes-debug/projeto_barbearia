import { TrendingDown, TrendingUp } from 'lucide-react'
import { Card } from '../../components/ui'
import { useAppData } from '../../state/useAppData'
import { getAssinantesEmDia, getMRR } from '../../lib/derive'
import { formatBRL } from '../../lib/format'
import { mrrHistorico } from '../../mocks/metrics'

export function MetricCardsRow() {
  const { state } = useAppData()

  const mrr = getMRR(state.assinaturas, state.planosAssinatura)
  const emDia = getAssinantesEmDia(state.assinaturas)

  const mesAtual = mrrHistorico[mrrHistorico.length - 1]?.valor ?? mrr
  const mesAnterior = mrrHistorico[mrrHistorico.length - 2]?.valor ?? mesAtual
  const variacao = mesAnterior > 0 ? ((mesAtual - mesAnterior) / mesAnterior) * 100 : 0
  const positiva = variacao >= 0

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card className="p-4">
        <p className="text-xs text-text-secondary">Receita mensal recorrente</p>
        <p className="mono-value mt-1 text-2xl text-text-primary">{formatBRL(mrr)}</p>
      </Card>

      <Card className="p-4">
        <p className="text-xs text-text-secondary">Assinantes em dia</p>
        <p className="mono-value mt-1 text-2xl text-text-primary">{emDia}</p>
      </Card>

      <Card className="p-4">
        <p className="text-xs text-text-secondary">Variação vs. mês anterior</p>
        <p
          className={`mono-value mt-1 flex items-center gap-1.5 text-2xl ${
            positiva ? 'text-status-green' : 'text-status-red'
          }`}
        >
          {positiva ? <TrendingUp size={20} aria-hidden="true" /> : <TrendingDown size={20} aria-hidden="true" />}
          {positiva ? '+' : ''}
          {variacao.toFixed(1)}%
        </p>
      </Card>
    </div>
  )
}
