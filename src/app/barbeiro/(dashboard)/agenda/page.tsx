import { SectionHeading, Card, EmptyState } from '../../../../components/ui'
import { AgendaDatePicker } from '../../../../components/agenda/AgendaDatePicker'
import { MinhaAgendaRow } from '../../../../components/barbeiro-self/MinhaAgendaRow'
import { BloquearMeuDiaButton } from '../../../../components/barbeiro-self/BloquearMeuDiaButton'
import { NovoAtendimentoAvulsoModal } from '../../../../components/barbeiro-self/NovoAtendimentoAvulsoModal'
import { requireBarbeiroAccess } from '../../../../lib/barbeiroAuth'
import { getGradeAgendaDoDia } from '../../../../db/queries/agendamentos'
import { getClientesResumo } from '../../../../db/queries/clientes'
import { getServicosAtivos } from '../../../../db/queries/servicos'
import { getAssinaturas, getPlanosAssinatura } from '../../../../db/queries/assinaturas'
import { getBarbeiros } from '../../../../db/queries/barbeiros'
import { getHojeISO, getHoraAtualBrasil, TIME_SLOTS } from '../../../../lib/dateUtils'

export default async function MinhaAgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string }>
}) {
  const barbeiro = await requireBarbeiroAccess()
  const { data } = await searchParams
  const dataISO = data || getHojeISO()

  const [grade, clientes, servicos, assinaturas, planos, barbeiros] = await Promise.all([
    getGradeAgendaDoDia(dataISO, [barbeiro.id], TIME_SLOTS),
    getClientesResumo(),
    getServicosAtivos(),
    getAssinaturas(),
    getPlanosAssinatura(),
    getBarbeiros(),
  ])

  const meus = [...grade].sort((a, b) => a.hora.localeCompare(b.hora))

  const horaAtual = getHoraAtualBrasil()
  const horaSugerida = [...TIME_SLOTS].reverse().find((h) => h <= horaAtual) ?? TIME_SLOTS[0]

  return (
    <div>
      <SectionHeading
        action={
          <div className="flex flex-wrap gap-2">
            <BloquearMeuDiaButton dataISO={dataISO} ehHoje={dataISO === getHojeISO()} />
            <NovoAtendimentoAvulsoModal
              clientes={clientes}
              servicos={servicos}
              barbeiros={barbeiros}
              horaSugerida={horaSugerida}
            />
          </div>
        }
      >
        Minha agenda
      </SectionHeading>
      <div className="mb-4">
        <AgendaDatePicker dataISO={dataISO} basePath="/barbeiro/agenda" />
      </div>

      {meus.length === 0 ? (
        <EmptyState title="Nada marcado" description="Você não tem horários neste dia." />
      ) : (
        <Card>
          {meus.map((agendamento) => (
            <MinhaAgendaRow
              key={agendamento.id}
              agendamento={agendamento}
              clientes={clientes}
              servicos={servicos}
              planos={planos}
              assinaturas={assinaturas}
              barbeiros={barbeiros}
            />
          ))}
        </Card>
      )}
    </div>
  )
}
