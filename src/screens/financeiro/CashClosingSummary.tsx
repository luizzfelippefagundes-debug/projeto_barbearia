import { Card, SectionHeading } from '../../components/ui'
import { useAppData } from '../../state/useAppData'
import { getFechamentoCaixa } from '../../lib/derive'
import { formatBRL } from '../../lib/format'
import { HOJE_ISO } from '../../lib/dateUtils'

const MES_REFERENCIA = HOJE_ISO.slice(0, 7)

export function CashClosingSummary() {
  const { state } = useAppData()

  const fechamento = getFechamentoCaixa(
    state.agendamentos,
    state.servicos,
    state.vendas,
    state.assinaturas,
    state.planosAssinatura,
    state.clientes,
    MES_REFERENCIA,
  )

  return (
    <div>
      <SectionHeading>Fechamento de caixa do mês</SectionHeading>
      <Card className="divide-y divide-border p-0">
        <Linha label="Assinaturas" valor={fechamento.assinatura} />
        <Linha label="Produtos" valor={fechamento.produtos} />
        <Linha label="Serviços avulsos" valor={fechamento.avulso} />
        <div className="flex items-center justify-between px-4 py-3">
          <span className="font-heading text-sm tracking-wide text-text-primary uppercase">Total</span>
          <span className="mono-value text-lg text-accent">{formatBRL(fechamento.total)}</span>
        </div>
      </Card>
    </div>
  )
}

function Linha({ label, valor }: { label: string; valor: number }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="mono-value text-sm text-text-primary">{formatBRL(valor)}</span>
    </div>
  )
}
