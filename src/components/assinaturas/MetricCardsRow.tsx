import { UserPlus } from 'lucide-react'
import type { Assinatura, PlanoAssinatura } from '../../types'
import { Card } from '../../components/ui'
import { getAssinantesEmDia, getMRR } from '../../lib/derive'
import { formatBRL } from '../../lib/format'
import { mesReferenciaDeData } from '../../lib/dateUtils'

export function MetricCardsRow({
  assinaturas,
  planos,
}: {
  assinaturas: Assinatura[]
  planos: PlanoAssinatura[]
}) {
  const mrr = getMRR(assinaturas, planos)
  const emDia = getAssinantesEmDia(assinaturas)

  const mesReferencia = mesReferenciaDeData(new Date().toISOString())
  const novasEsteMes = assinaturas.filter(
    (a) => mesReferenciaDeData(a.criadoEm) === mesReferencia,
  ).length

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card className="p-4">
        <p className="text-xs text-text-secondary">Receita mensal recorrente</p>
        <p className="mono-value mt-1 text-2xl text-text-primary">{formatBRL(mrr)}</p>
      </Card>

      <Card className="p-4">
        <p className="text-xs text-text-secondary">Assinantes em dia</p>
        <p className="mono-value mt-1 text-2xl text-text-primary">{emDia}</p>
      </Card>

      <Card className="p-4">
        <p className="text-xs text-text-secondary">Novas assinaturas este mês</p>
        <p className="mono-value mt-1 flex items-center gap-1.5 text-2xl text-status-green">
          <UserPlus size={20} aria-hidden="true" />
          {novasEsteMes}
        </p>
      </Card>
    </div>
  )
}
