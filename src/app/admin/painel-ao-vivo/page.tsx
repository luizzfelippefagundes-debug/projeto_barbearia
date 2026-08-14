import { Scissors } from 'lucide-react'
import { NOME_BARBEARIA } from '../../../lib/constants'
import { getHojeISO, formatDateDisplay, mesReferenciaDeData } from '../../../lib/dateUtils'
import { getBarbeiros } from '../../../db/queries/barbeiros'
import { getAgendamentosDoMes } from '../../../db/queries/agendamentos'
import { getServicosAtivos } from '../../../db/queries/servicos'
import { getVendas } from '../../../db/queries/vendas'
import { getFilaEspera } from '../../../db/queries/filaEspera'
import { getClientesResumo } from '../../../db/queries/clientes'
import { getMetaFaturamentoMensal } from '../../../db/queries/configuracoes'
import { getFaturamentoAcumuladoPorDia } from '../../../lib/derive'
import { BarbeiroRankingBoard } from '../../../components/painel-ao-vivo/BarbeiroRankingBoard'
import { NextClientCallout } from '../../../components/painel-ao-vivo/NextClientCallout'
import { RevenueGoalBar } from '../../../components/painel-ao-vivo/RevenueGoalBar'
import { AutoRefresh } from '../../../components/painel-ao-vivo/AutoRefresh'

export default async function PainelAoVivoPage() {
  const hojeISO = getHojeISO()
  const mesReferencia = mesReferenciaDeData(hojeISO)

  const [barbeiros, agendamentos, servicos, vendas, filaEspera, clientes, meta] = await Promise.all([
    getBarbeiros(),
    getAgendamentosDoMes(mesReferencia),
    getServicosAtivos(),
    getVendas(),
    getFilaEspera(),
    getClientesResumo(),
    getMetaFaturamentoMensal(),
  ])

  const pontos = getFaturamentoAcumuladoPorDia(agendamentos, servicos, vendas, mesReferencia, hojeISO)
  const faturamentoAtual = pontos[pontos.length - 1]?.valor ?? 0

  return (
    <div className="min-h-screen bg-[#0b1130] px-10 py-8 text-white">
      <AutoRefresh />
      <header className="mb-8 flex items-center justify-between border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-white">
            <Scissors size={24} aria-hidden="true" />
          </span>
          <span className="font-heading text-3xl font-bold text-white">{NOME_BARBEARIA}</span>
        </div>
        <span className="font-heading text-lg font-medium text-white/60">
          {formatDateDisplay(hojeISO)}
        </span>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]">
        <BarbeiroRankingBoard
          barbeiros={barbeiros}
          agendamentos={agendamentos}
          servicos={servicos}
          mesReferencia={mesReferencia}
        />
        <div className="flex flex-col gap-6">
          <NextClientCallout filaEspera={filaEspera} clientes={clientes} barbeiros={barbeiros} />
          <RevenueGoalBar faturamentoAtual={faturamentoAtual} meta={meta} />
        </div>
      </div>
    </div>
  )
}
