import { Card, EmptyState, SectionHeading } from '../../components/ui'
import { SimpleLineChart } from '../../components/ui/Chart/SimpleLineChart'

const MESES_ABREV = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

function formatMesAbrev(mesReferencia: string): string {
  const indice = Number(mesReferencia.slice(5, 7)) - 1
  return MESES_ABREV[indice]
}

export function NovosAssinantesCard({
  pontos,
}: {
  pontos: Array<{ mes: string; quantidade: number }>
}) {
  const data = pontos.map((p) => ({ label: formatMesAbrev(p.mes), value: p.quantidade }))
  const temAssinante = pontos.some((p) => p.quantidade > 0)

  return (
    <div>
      <SectionHeading>Novos assinantes por mês</SectionHeading>
      <Card className="p-5">
        {temAssinante ? (
          <SimpleLineChart data={data} height={100} formatType="count" />
        ) : (
          <EmptyState
            title="Sem novos assinantes ainda"
            description="Assim que alguém assinar um plano, o crescimento aparece aqui."
          />
        )}
      </Card>
    </div>
  )
}
