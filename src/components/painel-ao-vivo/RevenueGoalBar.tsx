import { ProgressBar } from '../../components/ui'
import { formatBRL } from '../../lib/format'

export function RevenueGoalBar({
  faturamentoAtual,
  meta,
}: {
  faturamentoAtual: number
  meta: number | null
}) {
  if (!meta) {
    return (
      <div className="rounded border border-border bg-surface p-6">
        <span className="font-heading text-sm tracking-widest text-text-secondary uppercase">
          Faturamento do mês
        </span>
        <p className="mono-value mt-2 text-3xl text-text-primary">{formatBRL(faturamentoAtual)}</p>
        <p className="mt-1 text-xs text-text-secondary">Meta ainda não definida (em Financeiro).</p>
      </div>
    )
  }

  const percent = Math.min(100, Math.round((faturamentoAtual / meta) * 100))

  return (
    <div className="rounded border border-border bg-surface p-6">
      <div className="mb-3 flex items-end justify-between">
        <span className="font-heading text-sm tracking-widest text-text-secondary uppercase">
          Meta de faturamento do mês
        </span>
        <span className="mono-value text-lg text-brass">{percent}%</span>
      </div>
      <ProgressBar
        value={faturamentoAtual}
        max={meta}
        colorClassName="bg-brass"
        className="h-4"
        label="Progresso da meta de faturamento mensal"
      />
      <div className="mt-2 flex justify-between text-sm text-text-secondary">
        <span className="mono-value">{formatBRL(faturamentoAtual)}</span>
        <span className="mono-value">{formatBRL(meta)}</span>
      </div>
    </div>
  )
}
