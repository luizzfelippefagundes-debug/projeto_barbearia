import { SectionHeading } from '../../../../components/ui'
import { FinanceiroKpiRow } from '../../../../components/financeiro/FinanceiroKpiRow'
import { ClientesSumindoAlert } from '../../../../components/financeiro/ClientesSumindoAlert'
import { RevenueAccumulatedChart } from '../../../../components/financeiro/RevenueAccumulatedChart'
import { PriceSimulator } from '../../../../components/financeiro/PriceSimulator'
import { MetaFaturamentoCard } from '../../../../components/financeiro/MetaFaturamentoCard'
import { FechamentoCaixaResumo } from '../../../../components/financeiro/FechamentoCaixaResumo'
import { ResumoPagamentosCard } from '../../../../components/financeiro/ResumoPagamentosCard'
import { getBarbeiros } from '../../../../db/queries/barbeiros'
import { getMetaFaturamentoMensal } from '../../../../db/queries/configuracoes'
import { getAgendamentosDoMes, getAgendamentosDoDia } from '../../../../db/queries/agendamentos'
import { getServicosAtivos } from '../../../../db/queries/servicos'
import { getVendas } from '../../../../db/queries/vendas'
import { getAssinaturas, getPlanosAssinatura } from '../../../../db/queries/assinaturas'
import { getClientesComHistorico, getClientesResumo } from '../../../../db/queries/clientes'
import { getFechamentoCaixaSalvo } from '../../../../db/queries/fechamentoCaixa'
import {
  getFechamentoCaixaDoDia,
  getFechamentoCaixaDaSemana,
  getFechamentoCaixa,
  getResumoPagamentosAvulso,
} from '../../../../lib/derive'
import { getHojeISO, mesReferenciaDeData, getInicioFimSemana } from '../../../../lib/dateUtils'
import type { Agendamento } from '../../../../types'

export default async function FinanceiroPage() {
  const hojeISO = getHojeISO()
  const mesReferencia = mesReferenciaDeData(hojeISO)
  const { inicio: inicioSemana, fim: fimSemana } = getInicioFimSemana(hojeISO)
  const mesReferenciaInicioSemana = mesReferenciaDeData(inicioSemana)

  const [
    barbeiros,
    agendamentos,
    agendamentosMesInicioSemana,
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
    mesReferenciaInicioSemana === mesReferencia
      ? Promise.resolve<Agendamento[]>([])
      : getAgendamentosDoMes(mesReferenciaInicioSemana),
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

  // A semana atual pode cruzar dois meses — junta os agendamentos dos dois
  // meses envolvidos pra não perder atendimentos que caíram no mês anterior.
  const agendamentosParaSemana = [...agendamentos, ...agendamentosMesInicioSemana]

  const fechamentoDoDia =
    fechamentoSalvo ??
    getFechamentoCaixaDoDia(agendamentosHoje, servicos, vendas, assinaturas, planos, clientesResumo, hojeISO)

  const fechamentoDaSemana = getFechamentoCaixaDaSemana(
    agendamentosParaSemana,
    servicos,
    vendas,
    assinaturas,
    planos,
    clientesResumo,
    inicioSemana,
    fimSemana,
  )

  const fechamentoDoMes = getFechamentoCaixa(
    agendamentos,
    servicos,
    vendas,
    assinaturas,
    planos,
    clientesResumo,
    mesReferencia,
  )
  const resumoPagamentos = getResumoPagamentosAvulso(agendamentos, servicos, barbeiros, mesReferencia)

  return (
    <div className="flex flex-col gap-8">
      <FechamentoCaixaResumo
        dataISO={hojeISO}
        inicioSemana={inicioSemana}
        fimSemana={fimSemana}
        dia={fechamentoDoDia}
        semana={fechamentoDaSemana}
        mes={fechamentoDoMes}
        fechado={!!fechamentoSalvo}
        fechadoEm={fechamentoSalvo?.fechadoEm}
        fechadoPorNome={fechamentoSalvo?.fechadoPorNome}
      />
      <div>
        <SectionHeading>Financeiro</SectionHeading>
        <FinanceiroKpiRow
          agendamentos={agendamentos}
          servicos={servicos}
          vendas={vendas}
          barbeiros={barbeiros}
          assinaturas={assinaturas}
          planos={planos}
          clientes={clientes}
          mesReferencia={mesReferencia}
        />
      </div>
      <ResumoPagamentosCard resumo={resumoPagamentos} />
      <MetaFaturamentoCard metaAtual={metaFaturamento} />
      <ClientesSumindoAlert clientes={clientes} />
      <RevenueAccumulatedChart
        agendamentos={agendamentos}
        servicos={servicos}
        vendas={vendas}
        mesReferencia={mesReferencia}
      />
      <PriceSimulator assinaturas={assinaturas} planos={planos} />
    </div>
  )
}
