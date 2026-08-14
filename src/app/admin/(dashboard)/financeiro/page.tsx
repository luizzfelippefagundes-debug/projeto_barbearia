import { SectionHeading } from '../../../../components/ui'
import { FinanceiroKpiRow } from '../../../../components/financeiro/FinanceiroKpiRow'
import { ClientesSumindoAlert } from '../../../../components/financeiro/ClientesSumindoAlert'
import { RevenueAccumulatedChart } from '../../../../components/financeiro/RevenueAccumulatedChart'
import { PriceSimulator } from '../../../../components/financeiro/PriceSimulator'
import { CashClosingSummary } from '../../../../components/financeiro/CashClosingSummary'
import { getBarbeiros } from '../../../../db/queries/barbeiros'
import { getAgendamentosDoMes } from '../../../../db/queries/agendamentos'
import { getServicosAtivos } from '../../../../db/queries/servicos'
import { getVendas } from '../../../../db/queries/vendas'
import { getAssinaturas, getPlanosAssinatura } from '../../../../db/queries/assinaturas'
import { getClientesComHistorico } from '../../../../db/queries/clientes'
import { getHojeISO, mesReferenciaDeData } from '../../../../lib/dateUtils'

export default async function FinanceiroPage() {
  const mesReferencia = mesReferenciaDeData(getHojeISO())

  const [barbeiros, agendamentos, servicos, vendas, assinaturas, planos, clientes] = await Promise.all([
    getBarbeiros(),
    getAgendamentosDoMes(mesReferencia),
    getServicosAtivos(),
    getVendas(),
    getAssinaturas(),
    getPlanosAssinatura(),
    getClientesComHistorico(),
  ])

  return (
    <div className="flex flex-col gap-8">
      <div>
        <SectionHeading>Financeiro</SectionHeading>
        <FinanceiroKpiRow
          agendamentos={agendamentos}
          servicos={servicos}
          barbeiros={barbeiros}
          assinaturas={assinaturas}
          planos={planos}
          clientes={clientes}
          mesReferencia={mesReferencia}
        />
      </div>
      <ClientesSumindoAlert clientes={clientes} />
      <RevenueAccumulatedChart
        agendamentos={agendamentos}
        servicos={servicos}
        vendas={vendas}
        mesReferencia={mesReferencia}
      />
      <PriceSimulator assinaturas={assinaturas} planos={planos} />
      <CashClosingSummary
        agendamentos={agendamentos}
        servicos={servicos}
        vendas={vendas}
        assinaturas={assinaturas}
        planos={planos}
        clientes={clientes}
        mesReferencia={mesReferencia}
      />
    </div>
  )
}
