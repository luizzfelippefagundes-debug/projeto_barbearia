import { ProgressBar } from '../../components/ui'
import { formatBRL } from '../../lib/format'
import { faturamentoAtualMes, metaFaturamentoMes } from '../../mocks/metrics'

export function RevenueGoalBar() {
  const percent = Math.min(100, Math.round((faturamentoAtualMes / metaFaturamentoMes) * 100))

  return (
    <div className="rounded border border-border bg-surface p-6">
      <div className="mb-3 flex items-end justify-between">
        <span className="font-heading text-sm tracking-widest text-text-secondary uppercase">
          Meta de faturamento do mês
        </span>
        <span className="mono-value text-lg text-brass">{percent}%</span>
      </div>
      <ProgressBar
        value={faturamentoAtualMes}
        max={metaFaturamentoMes}
        colorClassName="bg-brass"
        className="h-4"
        label="Progresso da meta de faturamento mensal"
      />
      <div className="mt-2 flex justify-between text-sm text-text-secondary">
        <span className="mono-value">{formatBRL(faturamentoAtualMes)}</span>
        <span className="mono-value">{formatBRL(metaFaturamentoMes)}</span>
      </div>
    </div>
  )
}
