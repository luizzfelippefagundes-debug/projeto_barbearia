import { Card, SectionHeading } from '../../components/ui'
import { SimpleLineChart } from '../../components/ui/Chart/SimpleLineChart'
import { faturamentoPrevistoMes } from '../../mocks/metrics'
import { formatBRL } from '../../lib/format'

export function RevenueForecastChart() {
  const data = faturamentoPrevistoMes.map((p) => ({ label: `${p.dia}`, value: p.valor }))

  return (
    <div>
      <SectionHeading>Previsão de faturamento do mês</SectionHeading>
      <Card className="p-5">
        <SimpleLineChart data={data} formatValue={formatBRL} />
      </Card>
    </div>
  )
}
