import { Trophy } from 'lucide-react'
import type { Barbeiro } from '../../types'
import { Avatar, Card, EmptyState, SectionHeading } from '../../components/ui'
import { formatBRL } from '../../lib/format'
import { cn } from '../../lib/cn'

const MEDALHAS = ['text-brass', 'text-text-secondary', 'text-accent']

export function RankingBarbeirosCard({
  ranking,
}: {
  ranking: Array<{ barbeiro: Barbeiro; cortes: number; faturamento: number }>
}) {
  const comMovimento = ranking.filter((r) => r.cortes > 0)

  return (
    <div>
      <SectionHeading>Ranking de barbeiros este mês</SectionHeading>
      <Card className="flex flex-col divide-y divide-border p-0">
        {comMovimento.length === 0 ? (
          <div className="p-5">
            <EmptyState title="Sem cortes ainda este mês" description="O ranking aparece assim que houver atendimentos." />
          </div>
        ) : (
          comMovimento.map((r, i) => (
            <div key={r.barbeiro.id} className="flex items-center gap-3 px-5 py-3">
              <span
                className={cn(
                  'flex w-5 shrink-0 items-center justify-center text-sm font-semibold',
                  i < 3 ? MEDALHAS[i] : 'text-text-secondary',
                )}
              >
                {i < 3 ? <Trophy size={16} aria-hidden="true" /> : i + 1}
              </span>
              <Avatar nome={r.barbeiro.nome} src={r.barbeiro.avatarUrl} size="sm" />
              <div className="flex-1">
                <p className="text-sm text-text-primary">{r.barbeiro.nome}</p>
                <p className="text-xs text-text-secondary">{r.cortes} cortes</p>
              </div>
              <span className="mono-value text-sm text-text-primary">{formatBRL(r.faturamento)}</span>
            </div>
          ))
        )}
      </Card>
    </div>
  )
}
