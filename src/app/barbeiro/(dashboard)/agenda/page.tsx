import { SectionHeading, Card, EmptyState } from '../../../../components/ui'
import { DateNav } from '../../../../components/agenda/DateNav'
import { MinhaAgendaRow } from '../../../../components/barbeiro-self/MinhaAgendaRow'
import { requireBarbeiroAccess } from '../../../../lib/barbeiroAuth'
import { getAgendamentosDoDia } from '../../../../db/queries/agendamentos'
import { getClientesResumo } from '../../../../db/queries/clientes'
import { getServicosAtivos } from '../../../../db/queries/servicos'
import { getHojeISO } from '../../../../lib/dateUtils'

export default async function MinhaAgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string }>
}) {
  const barbeiro = await requireBarbeiroAccess()
  const { data } = await searchParams
  const dataISO = data || getHojeISO()

  const [agendamentosDoDia, clientes, servicos] = await Promise.all([
    getAgendamentosDoDia(dataISO),
    getClientesResumo(),
    getServicosAtivos(),
  ])

  const meus = agendamentosDoDia
    .filter((a) => a.barbeiroId === barbeiro.id && a.status !== 'livre')
    .sort((a, b) => a.hora.localeCompare(b.hora))

  return (
    <div>
      <SectionHeading>Minha agenda</SectionHeading>
      <div className="mb-4">
        <DateNav dataISO={dataISO} basePath="/barbeiro/agenda" />
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
            />
          ))}
        </Card>
      )}
    </div>
  )
}
