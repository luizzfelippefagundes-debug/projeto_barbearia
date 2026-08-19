import { Card, ProgressBar } from '../../components/ui'
import type { Cliente } from '../../types'

export function ClienteLoyaltyProgress({ cliente }: { cliente: Cliente }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-text-secondary">Fidelidade</p>
      <p className="mono-value mt-1 text-xl text-text-primary">
        {cliente.loyaltyCortesAtual}
        <span className="text-sm text-text-secondary">/{cliente.loyaltyCortesMeta}</span>
      </p>
      <ProgressBar
        value={cliente.loyaltyCortesAtual}
        max={cliente.loyaltyCortesMeta}
        colorClassName="bg-accent"
        label="Progresso de fidelidade"
        className="mt-2"
      />
    </Card>
  )
}
