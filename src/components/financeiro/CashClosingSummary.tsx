import type { Agendamento, Assinatura, Cliente, PlanoAssinatura, Servico, Venda } from '../../types'
import { Card, SectionHeading } from '../../components/ui'
import { getFechamentoCaixa } from '../../lib/derive'
import { formatBRL } from '../../lib/format'

interface CashClosingSummaryProps {
  agendamentos: Agendamento[]
  servicos: Servico[]
  vendas: Venda[]
  assinaturas: Assinatura[]
  planos: PlanoAssinatura[]
  clientes: Cliente[]
  mesReferencia: string
}

export function CashClosingSummary({
  agendamentos,
  servicos,
  vendas,
  assinaturas,
  planos,
  clientes,
  mesReferencia,
}: CashClosingSummaryProps) {
  const fechamento = getFechamentoCaixa(
    agendamentos,
    servicos,
    vendas,
    assinaturas,
    planos,
    clientes,
    mesReferencia,
  )

  return (
    <div>
      <SectionHeading>Fechamento de caixa do mês</SectionHeading>
      <Card className="divide-y divide-border p-0">
        <Linha label="Assinaturas" valor={fechamento.assinatura} />
        <Linha label="Produtos" valor={fechamento.produtos} />
        <Linha label="Serviços avulsos" valor={fechamento.avulso} />
        <div className="flex items-center justify-between px-4 py-3">
          <span className="font-heading text-sm font-bold text-text-primary">Total</span>
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
