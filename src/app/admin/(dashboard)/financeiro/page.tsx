import { SectionHeading } from '../../../../components/ui'
import { FinanceiroKpiRow } from '../../../../components/financeiro/FinanceiroKpiRow'
import { ClientesSumindoAlert } from '../../../../components/financeiro/ClientesSumindoAlert'
import { RevenueAccumulatedChart } from '../../../../components/financeiro/RevenueAccumulatedChart'
import { PriceSimulator } from '../../../../components/financeiro/PriceSimulator'
import { CashClosingSummary } from '../../../../components/financeiro/CashClosingSummary'
import { MetaFaturamentoCard } from '../../../../components/financeiro/MetaFaturamentoCard'
import { FechamentoCaixaDia } from '../../../../components/financeiro/FechamentoCaixaDia'
import { getBarbeiros } from '../../../../db/queries/barbeiros'
import { getMetaFaturamentoMensal } from '../../../../db/queries/configuracoes'
import { getAgendamentosDoMes, getAgendamentosDoDia } from '../../../../db/queries/agendamentos'
import { getServicosAtivos } from '../../../../db/queries/servicos'
import { getVendas } from '../../../../db/queries/vendas'
import { getAssinaturas, getPlanosAssinatura } from '../../../../db/queries/assinaturas'
import { getClientesComHistorico, getClientesResumo } from '../../../../db/queries/clientes'
import { getFechamentoCaixaSalvo } from '../../../../db/queries/fechamentoCaixa'
import { getFechamentoCaixaDoDia } from '../../../../lib/derive'
import { getHojeISO, mesReferenciaDeData } from '../../../../lib/dateUtils'

export default async function FinanceiroPage() {
  const hojeISO = getHojeISO()
  const mesReferencia = mesReferenciaDeData(hojeISO)

  const [
    barbeiros,
    agendamentos,
    servicos,
    vendas,
    assinaturas,
    planos,
    clientes,
    metaFaturamento,
    agendamentosHoje,
    clientesResumo,
    fechamentoSalvo,
  ] = await Promise.all([
    getBarbeiros(),
    getAgendamentosDoMes(mesReferencia),
    getServicosAtivos(),
    getVendas(),
    getAssinaturas(),
    getPlanosAssinatura(),
    getClientesComHistorico(),
    getMetaFaturamentoMensal(),
    getAgendamentosDoDia(hojeISO),
    getClientesResumo(),
    getFechamentoCaixaSalvo(hojeISO),
  ])

  const fechamentoDoDia =
    fechamentoSalvo ??
    getFechamentoCaixaDoDia(agendamentosHoje, servicos, vendas, assinaturas, planos, clientesResumo, hojeISO)

  return (
    <div className="flex flex-col gap-8">
      <FechamentoCaixaDia
        dataISO={hojeISO}
        avulso={fechamentoDoDia.avulso}
        assinatura={fechamentoDoDia.assinatura}
        produtos={fechamentoDoDia.produtos}
        total={fechamentoDoDia.total}
        fechado={!!fechamentoSalvo}
        fechadoEm={fechamentoSalvo?.fechadoEm}
        fechadoPorNome={fechamentoSalvo?.fechadoPorNome}
      />
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
      <MetaFaturamentoCard metaAtual={metaFaturamento} />
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
