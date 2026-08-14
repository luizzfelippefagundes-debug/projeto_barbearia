import type { Assinatura } from '../../types'
import { StatusPill } from '../../components/ui'
import { useAppData } from '../../state/useAppData'
import { formatBRL, formatDataCurta } from '../../lib/format'

export function SubscriberRow({ assinatura }: { assinatura: Assinatura }) {
  const { state } = useAppData()
  const cliente = state.clientes.find((c) => c.id === assinatura.clienteId)
  const plano = state.planosAssinatura.find((p) => p.id === assinatura.planoId)

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3 last:border-b-0">
      <div className="min-w-[9rem]">
        <p className="text-sm text-text-primary">{cliente?.nome}</p>
        <p className="text-xs text-text-secondary">{plano?.nome}</p>
      </div>
      <div className="flex items-center gap-6">
        <span className="mono-value text-sm text-text-primary">{formatBRL(plano?.valorMensal ?? 0)}</span>
        <span className="text-xs text-text-secondary">
          Próxima: {formatDataCurta(assinatura.proximaCobranca)}
        </span>
        <StatusPill status={assinatura.status} />
      </div>
    </div>
  )
}
