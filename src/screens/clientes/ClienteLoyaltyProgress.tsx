import { ProgressBar } from '../../components/ui'
import type { Cliente } from '../../types'

export function ClienteLoyaltyProgress({ cliente }: { cliente: Cliente }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs text-text-secondary">Fidelidade</span>
        <span className="mono-value text-xs text-brass">
          {cliente.loyaltyCortesAtual} de {cliente.loyaltyCortesMeta} cortes
        </span>
      </div>
      <ProgressBar
        value={cliente.loyaltyCortesAtual}
        max={cliente.loyaltyCortesMeta}
        colorClassName="bg-accent"
        label="Progresso de fidelidade"
      />
    </div>
  )
}
