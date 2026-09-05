import { TrendingDown, TrendingUp } from 'lucide-react'
import { Card, EmptyState, SectionHeading } from '../../components/ui'
import { SimpleLineChart } from '../../components/ui/Chart/SimpleLineChart'
import { formatBRL } from '../../lib/format'
import { cn } from '../../lib/cn'

export function FaturamentoMesCard({
  valorAtual,
  valorMesAnterior,
  pontosAcumulado,
}: {
  valorAtual: number
  valorMesAnterior: number
  pontosAcumulado: Array<{ dia: number; valor: number }>
}) {
  const variacao =
    valorMesAnterior > 0 ? Math.round(((valorAtual - valorMesAnterior) / valorMesAnterior) * 1000) / 10 : null
  const subiu = variacao !== null && variacao >= 0
  const data = pontosAcumulado.map((p) => ({ label: `${p.dia}`, value: p.valor }))
  const temMovimento = pontosAcumulado.some((p) => p.valor > 0)

  return (
    <div>
      <SectionHeading>Faturamento em serviços e produtos este mês</SectionHeading>
      <Card className="flex flex-col gap-4 p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <p className="mono-value text-3xl text-text-primary">{formatBRL(valorAtual)}</p>
          {variacao !== null && (
            <span
              className={cn(
                'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
                subiu ? 'bg-status-green-muted text-status-green' : 'bg-status-red-muted text-status-red',
              )}
            >
              {subiu ? <TrendingUp size={14} aria-hidden="true" /> : <TrendingDown size={14} aria-hidden="true" />}
              {Math.abs(variacao)}% vs mês passado
            </span>
          )}
        </div>
        {temMovimento ? (
          <SimpleLineChart data={data} formatValue={formatBRL} />
        ) : (
          <EmptyState title="Sem movimento este mês" description="Assim que houver cortes ou vendas, o acumulado aparece aqui." />
        )}
      </Card>
    </div>
  )
}
