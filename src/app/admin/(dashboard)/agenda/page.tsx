import { SectionHeading } from '../../../../components/ui'
import { DateNav } from '../../../../components/agenda/DateNav'
import { ScheduleList } from '../../../../components/agenda/ScheduleList'
import { NovoHorarioModal } from '../../../../components/agenda/NovoHorarioModal'
import { WaitlistSection } from '../../../../components/agenda/WaitlistSection'
import { getBarbeiros } from '../../../../db/queries/barbeiros'
import { getClientesResumo } from '../../../../db/queries/clientes'
import { getServicosAtivos } from '../../../../db/queries/servicos'
import { getGradeAgendaDoDia } from '../../../../db/queries/agendamentos'
import { getFilaEspera } from '../../../../db/queries/filaEspera'
import { getHojeISO, TIME_SLOTS } from '../../../../lib/dateUtils'

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string }>
}) {
  const { data } = await searchParams
  const dataISO = data || getHojeISO()

  const [barbeiros, clientes, servicos, filaEspera] = await Promise.all([
    getBarbeiros(),
    getClientesResumo(),
    getServicosAtivos(),
    getFilaEspera(),
  ])

  const barbeirosAtivos = barbeiros.filter((b) => b.ativo)
  const grade = await getGradeAgendaDoDia(
    dataISO,
    barbeirosAtivos.map((b) => b.id),
    TIME_SLOTS,
  )

  return (
    <div className="flex flex-col gap-8">
      <div>
        <SectionHeading
          action={
            <NovoHorarioModal
              dataISO={dataISO}
              barbeiros={barbeirosAtivos}
              clientes={clientes}
              servicos={servicos}
            />
          }
        >
          Agenda
        </SectionHeading>
        <div className="mb-4">
          <DateNav dataISO={dataISO} />
        </div>
        <ScheduleList
          agendamentos={grade}
          barbeiros={barbeiros}
          clientes={clientes}
          servicos={servicos}
        />
      </div>

      <WaitlistSection
        filaEspera={filaEspera}
        clientes={clientes}
        barbeiros={barbeiros}
        servicos={servicos}
      />
    </div>
  )
}
