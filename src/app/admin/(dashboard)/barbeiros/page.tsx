import { SectionHeading, EmptyState } from '../../../../components/ui'
import { BarbeiroCard } from '../../../../components/barbeiros/BarbeiroCard'
import { NovoBarbeiroButton } from '../../../../components/barbeiros/NovoBarbeiroButton'
import { getBarbeiros } from '../../../../db/queries/barbeiros'
import { getAgendamentosDoMes } from '../../../../db/queries/agendamentos'
import { getServicosAtivos } from '../../../../db/queries/servicos'
import { getPayoutsDoMes } from '../../../../db/queries/payouts'
import {
  getCortesNoMesPorBarbeiro,
  getFaturamentoGeradoPorBarbeiroNoMes,
  getValorAReceber,
} from '../../../../lib/derive'
import { getHojeISO, mesReferenciaDeData } from '../../../../lib/dateUtils'

export default async function BarbeirosPage() {
  const mesReferencia = mesReferenciaDeData(getHojeISO())

  const [barbeiros, agendamentos, servicos, payouts] = await Promise.all([
    getBarbeiros(),
    getAgendamentosDoMes(mesReferencia),
    getServicosAtivos(),
    getPayoutsDoMes(mesReferencia),
  ])

  return (
    <div>
      <SectionHeading action={<NovoBarbeiroButton />}>Barbeiros e comissão</SectionHeading>

      {barbeiros.length === 0 ? (
        <EmptyState
          title="Nenhum barbeiro cadastrado"
          description="Cadastre o primeiro barbeiro para começar a montar a agenda."
        />
      ) : (
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
        >
          {barbeiros.map((barbeiro) => {
            const cortes = getCortesNoMesPorBarbeiro(agendamentos, barbeiro.id, mesReferencia)
            const faturamentoGerado = getFaturamentoGeradoPorBarbeiroNoMes(
              agendamentos,
              servicos,
              barbeiro.id,
              mesReferencia,
            )
            const valorAReceber = getValorAReceber(barbeiro, faturamentoGerado)
            return (
              <BarbeiroCard
                key={barbeiro.id}
                barbeiro={barbeiro}
                payout={payouts.find((p) => p.barbeiroId === barbeiro.id)}
                cortes={cortes}
                valorAReceber={valorAReceber}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
