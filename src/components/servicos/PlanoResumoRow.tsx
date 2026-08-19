import type { PlanoAssinatura } from '../../types'
import { formatBRL } from '../../lib/format'
import { cn } from '../../lib/cn'

export function PlanoResumoRow({ plano }: { plano: PlanoAssinatura }) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-b-0',
        !plano.ativo && 'opacity-50',
      )}
    >
      <div className="min-w-[10rem]">
        <div className="flex items-center gap-2">
          <p className="text-sm text-text-primary">{plano.nome}</p>
          {!plano.ativo && <span className="text-[10px] text-text-secondary">(inativo)</span>}
        </div>
        <p className="text-xs text-text-secondary">
          {plano.servicosInclusos.length === 0
            ? 'Nenhum serviço incluso'
            : plano.servicosInclusos
                .map((s) => (s.limiteMensal != null ? `${s.nome} (${s.limiteMensal}x/mês)` : s.nome))
                .join(', ')}
        </p>
      </div>
      <p className="mono-value text-sm text-text-primary">{formatBRL(plano.valorMensal)}/mês</p>
    </div>
  )
}
