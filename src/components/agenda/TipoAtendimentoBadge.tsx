import { cn } from '../../lib/cn'

export function TipoAtendimentoBadge({ tipo }: { tipo: 'plano' | 'avulso' }) {
  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-[10px] font-medium',
        tipo === 'plano'
          ? 'bg-status-green-muted text-status-green'
          : 'bg-surface-raised text-text-secondary',
      )}
    >
      {tipo === 'plano' ? 'Plano' : 'Avulso'}
    </span>
  )
}
