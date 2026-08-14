import type { Agendamento, Servico, Venda } from '../../types'
import { Card, EmptyState, SectionHeading } from '../../components/ui'
import { SimpleLineChart } from '../../components/ui/Chart/SimpleLineChart'
import { getFaturamentoAcumuladoPorDia } from '../../lib/derive'
import { formatBRL } from '../../lib/format'
import { getHojeISO } from '../../lib/dateUtils'

export function RevenueAccumulatedChart({
  agendamentos,
  servicos,
  vendas,
  mesReferencia,
}: {
  agendamentos: Agendamento[]
  servicos: Servico[]
  vendas: Venda[]
  mesReferencia: string
}) {
  const pontos = getFaturamentoAcumuladoPorDia(agendamentos, servicos, vendas, mesReferencia, getHojeISO())
  const data = pontos.map((p) => ({ label: `${p.dia}`, value: p.valor }))
  const temMovimento = pontos.some((p) => p.valor > 0)

  return (
    <div>
      <SectionHeading>Faturamento acumulado no mês</SectionHeading>
      <Card className="p-5">
        {temMovimento ? (
          <SimpleLineChart data={data} formatValue={formatBRL} />
        ) : (
          <EmptyState
            title="Sem movimento este mês"
            description="Assim que houver cortes ou vendas, o acumulado aparece aqui."
          />
        )}
      </Card>
    </div>
  )
}
