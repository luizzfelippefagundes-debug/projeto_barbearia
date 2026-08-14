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
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <span className="font-heading text-sm font-bold tracking-wide text-white/60 uppercase">
          Faturamento do mês
        </span>
        <p className="mono-value mt-2 text-3xl text-white">{formatBRL(faturamentoAtual)}</p>
        <p className="mt-1 text-xs text-white/40">Meta ainda não definida (em Financeiro).</p>
      </div>
    )
  }

  const percent = Math.min(100, Math.round((faturamentoAtual / meta) * 100))

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="mb-3 flex items-end justify-between">
        <span className="font-heading text-sm font-bold tracking-wide text-white/60 uppercase">
          Meta de faturamento do mês
        </span>
        <span className="mono-value text-lg text-accent-hover">{percent}%</span>
      </div>
      <div
        className="h-4 w-full overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-valuenow={faturamentoAtual}
        aria-valuemin={0}
        aria-valuemax={meta}
        aria-label="Progresso da meta de faturamento mensal"
      >
        <div
          className="h-full rounded-full bg-accent transition-[width]"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-sm text-white/60">
        <span className="mono-value">{formatBRL(faturamentoAtual)}</span>
        <span className="mono-value">{formatBRL(meta)}</span>
      </div>
    </div>
  )
}
