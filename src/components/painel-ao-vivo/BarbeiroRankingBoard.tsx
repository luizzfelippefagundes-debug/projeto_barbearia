import type { Agendamento, Barbeiro, Servico } from '../../types'
import { EmptyState } from '../../components/ui'
import { getRankingBarbeiros } from '../../lib/derive'
import { formatBRL } from '../../lib/format'
import { cn } from '../../lib/cn'

export function BarbeiroRankingBoard({
  barbeiros,
  agendamentos,
  servicos,
  mesReferencia,
}: {
  barbeiros: Barbeiro[]
  agendamentos: Agendamento[]
  servicos: Servico[]
  mesReferencia: string
}) {
  const ranking = getRankingBarbeiros(barbeiros, agendamentos, servicos, mesReferencia)

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-heading text-2xl tracking-wide text-brass uppercase">Ranking do mês</h2>
      {ranking.length === 0 ? (
        <EmptyState title="Sem barbeiros cadastrados" />
      ) : (
        <div className="flex flex-col gap-2">
          {ranking.map((entry, idx) => (
            <div
              key={entry.barbeiro.id}
              className={cn(
                'flex items-center justify-between gap-4 rounded border px-6 py-4',
                idx === 0 ? 'border-accent bg-accent-muted' : 'border-border bg-surface',
              )}
            >
              <div className="flex items-center gap-5">
                <span
                  className={cn('font-heading text-4xl', idx === 0 ? 'text-accent' : 'text-text-secondary')}
                >
                  #{idx + 1}
                </span>
                <span className="font-heading text-3xl tracking-wide text-text-primary uppercase">
                  {entry.barbeiro.nome}
                </span>
              </div>
              <div className="text-right">
                <p className="mono-value text-3xl text-text-primary">{formatBRL(entry.faturamento)}</p>
                <p className="text-sm text-text-secondary">{entry.cortes} cortes</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
