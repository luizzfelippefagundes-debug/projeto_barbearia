import { Card, SectionHeading } from '../../../../components/ui'
import { PayoutStatusPill } from '../../../../components/barbeiros/PayoutStatusPill'
import { requireBarbeiroAccess } from '../../../../lib/barbeiroAuth'
import { toAppBarbeiro } from '../../../../db/queries/barbeiros'
import { getAgendamentosDoMes } from '../../../../db/queries/agendamentos'
import { getServicosAtivos } from '../../../../db/queries/servicos'
import { getPayoutsDoMes } from '../../../../db/queries/payouts'
import {
  getCortesNoMesPorBarbeiro,
  getFaturamentoGeradoPorBarbeiroNoMes,
  getValorAReceber,
} from '../../../../lib/derive'
import { formatBRL } from '../../../../lib/format'
import { getHojeISO, mesReferenciaDeData } from '../../../../lib/dateUtils'

export default async function MinhaComissaoPage() {
  const barbeiro = toAppBarbeiro(await requireBarbeiroAccess())
  const mesReferencia = mesReferenciaDeData(getHojeISO())

  const [agendamentos, servicos, payouts] = await Promise.all([
    getAgendamentosDoMes(mesReferencia),
    getServicosAtivos(),
    getPayoutsDoMes(mesReferencia),
  ])

  const cortes = getCortesNoMesPorBarbeiro(agendamentos, barbeiro.id, mesReferencia)
  const faturamentoGerado = getFaturamentoGeradoPorBarbeiroNoMes(agendamentos, servicos, barbeiro.id, mesReferencia)
  const valorAReceber = getValorAReceber(barbeiro, faturamentoGerado)
  const payout = payouts.find((p) => p.barbeiroId === barbeiro.id)

  return (
    <div>
      <SectionHeading>Minha comissão</SectionHeading>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs text-text-secondary">Comissão</p>
          <p className="mono-value mt-1 text-2xl text-text-primary">{barbeiro.comissaoPercent}%</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-text-secondary">Cortes este mês</p>
          <p className="mono-value mt-1 text-2xl text-text-primary">{cortes}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-text-secondary">Faturamento gerado</p>
          <p className="mono-value mt-1 text-2xl text-text-primary">{formatBRL(faturamentoGerado)}</p>
        </Card>
      </div>

      <div className="mt-6">
        <Card className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-text-secondary">Valor a receber</p>
            <p className="mono-value text-3xl text-accent">{formatBRL(valorAReceber)}</p>
          </div>
          <PayoutStatusPill payout={payout} />
        </Card>
      </div>
    </div>
  )
}
