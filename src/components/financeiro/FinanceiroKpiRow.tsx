import type { Agendamento, Assinatura, Barbeiro, Cliente, PlanoAssinatura, Servico } from '../../types'
import { Card } from '../../components/ui'
import {
  getAssinantesEmDia,
  getFaturamentoGeradoPorBarbeiroNoMes,
  getFrequenciaRetornoDias,
  getMRR,
  getTicketMedio,
  getValorAReceber,
} from '../../lib/derive'
import { formatBRL } from '../../lib/format'

interface FinanceiroKpiRowProps {
  agendamentos: Agendamento[]
  servicos: Servico[]
  barbeiros: Barbeiro[]
  assinaturas: Assinatura[]
  planos: PlanoAssinatura[]
  clientes: Cliente[]
  mesReferencia: string
}

export function FinanceiroKpiRow({
  agendamentos,
  servicos,
  barbeiros,
  assinaturas,
  planos,
  clientes,
  mesReferencia,
}: FinanceiroKpiRowProps) {
  const mrr = getMRR(assinaturas, planos)
  const assinantesEmDia = getAssinantesEmDia(assinaturas)

  const totalComissoes = barbeiros.reduce((total, barbeiro) => {
    const faturamento = getFaturamentoGeradoPorBarbeiroNoMes(
      agendamentos,
      servicos,
      barbeiro.id,
      mesReferencia,
    )
    return total + getValorAReceber(barbeiro, faturamento)
  }, 0)

  const margemLiquidaPorAssinante = assinantesEmDia > 0 ? (mrr - totalComissoes) / assinantesEmDia : 0
  const ticketMedio = getTicketMedio(agendamentos, servicos, mesReferencia)

  const frequencias = clientes
    .map((c) => getFrequenciaRetornoDias(c))
    .filter((v): v is number => v !== null)
  const frequenciaMedia =
    frequencias.length > 0
      ? Math.round(frequencias.reduce((a, b) => a + b, 0) / frequencias.length)
      : null

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card className="p-4">
        <p className="text-xs text-text-secondary">Margem líquida por assinante</p>
        <p className="mono-value mt-1 text-2xl text-text-primary">{formatBRL(margemLiquidaPorAssinante)}</p>
      </Card>
      <Card className="p-4">
        <p className="text-xs text-text-secondary">Ticket médio</p>
        <p className="mono-value mt-1 text-2xl text-text-primary">{formatBRL(ticketMedio)}</p>
      </Card>
      <Card className="p-4">
        <p className="text-xs text-text-secondary">Frequência de retorno</p>
        <p className="mono-value mt-1 text-2xl text-text-primary">
          {frequenciaMedia !== null ? `${frequenciaMedia} dias` : '—'}
        </p>
      </Card>
    </div>
  )
}
