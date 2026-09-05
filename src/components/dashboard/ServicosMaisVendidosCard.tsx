import type { ServicoMaisVendido } from '../../lib/derive'
import { Card, EmptyState, SectionHeading } from '../../components/ui'
import { SimpleBarChart } from '../../components/ui/Chart/SimpleBarChart'
import { formatBRL } from '../../lib/format'

export function ServicosMaisVendidosCard({ servicos }: { servicos: ServicoMaisVendido[] }) {
  const top5 = servicos.slice(0, 5)
  const data = top5.map((s) => ({ label: s.servicoNome, value: s.faturamento }))

  return (
    <div>
      <SectionHeading>Serviços mais vendidos este mês</SectionHeading>
      <Card className="p-5">
        {top5.length === 0 ? (
          <EmptyState title="Sem vendas ainda este mês" description="Assim que houver cortes, o ranking aparece aqui." />
        ) : (
          <>
            <SimpleBarChart data={data} formatValue={formatBRL} />
            <div className="mt-4 flex flex-col gap-1.5 divide-y divide-border">
              {top5.map((s) => (
                <div key={s.servicoId} className="flex items-center justify-between pt-1.5 text-xs text-text-secondary first:pt-0">
                  <span>{s.servicoNome}</span>
                  <span className="mono-value">{s.quantidade}x</span>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
