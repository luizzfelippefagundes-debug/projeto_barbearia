import { SectionHeading } from '../../../../components/ui'
import { AgendaDatePicker } from '../../../../components/agenda/AgendaDatePicker'
import { BarbeiroTabs } from '../../../../components/agenda/BarbeiroTabs'
import { ScheduleList } from '../../../../components/agenda/ScheduleList'
import { NovoHorarioModal } from '../../../../components/agenda/NovoHorarioModal'
import { BloquearDiaButton } from '../../../../components/agenda/BloquearDiaButton'
import { NovoAtendimentoAvulsoModal } from '../../../../components/barbeiro-self/NovoAtendimentoAvulsoModal'
import { requireAdminAccess } from '../../../../lib/adminAuth'
import { getBarbeiros } from '../../../../db/queries/barbeiros'
import { getClientesResumo } from '../../../../db/queries/clientes'
import { getServicosAtivos } from '../../../../db/queries/servicos'
import { getGradeAgendaDoDia } from '../../../../db/queries/agendamentos'
import { getAssinaturas, getPlanosAssinatura } from '../../../../db/queries/assinaturas'
import { getHojeISO, getHoraAtualBrasil, TIME_SLOTS } from '../../../../lib/dateUtils'

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string; barbeiro?: string }>
}) {
  const dono = await requireAdminAccess()
  const { data, barbeiro } = await searchParams
  const dataISO = data || getHojeISO()

  const [barbeiros, clientes, servicos, assinaturas, planos] = await Promise.all([
    getBarbeiros(),
    getClientesResumo(),
    getServicosAtivos(),
    getAssinaturas(),
    getPlanosAssinatura(),
  ])

  const barbeirosAtivos = barbeiros.filter((b) => b.ativo)
  const barbeiroSelecionado =
    barbeiro && (barbeiro === 'todos' || barbeirosAtivos.some((b) => b.id === barbeiro)) ? barbeiro : dono.id

  const idsParaGrade =
    barbeiroSelecionado === 'todos' ? barbeirosAtivos.map((b) => b.id) : [barbeiroSelecionado]
  const grade = await getGradeAgendaDoDia(dataISO, idsParaGrade, TIME_SLOTS)

  const horaAtual = getHoraAtualBrasil()
  const horaSugerida = [...TIME_SLOTS].reverse().find((h) => h <= horaAtual) ?? TIME_SLOTS[0]

  return (
    <div className="flex flex-col gap-8">
      <div>
        <SectionHeading
          action={
            <div className="flex flex-wrap gap-2">
              <BloquearDiaButton dataISO={dataISO} barbeiros={barbeirosAtivos} />
              <NovoHorarioModal
                dataISO={dataISO}
                barbeiros={barbeirosAtivos}
                clientes={clientes}
                servicos={servicos}
              />
              <NovoAtendimentoAvulsoModal
                clientes={clientes}
                servicos={servicos}
                barbeiros={barbeirosAtivos}
                horaSugerida={horaSugerida}
              />
            </div>
          }
        >
          Agenda
        </SectionHeading>
        <div className="mb-3">
          <BarbeiroTabs barbeiros={barbeirosAtivos} selecionado={barbeiroSelecionado} dataISO={dataISO} />
        </div>
        <div className="mb-4">
          <AgendaDatePicker dataISO={dataISO} barbeiro={barbeiroSelecionado} />
        </div>
        <ScheduleList
          agendamentos={grade}
          barbeiros={barbeiros}
          clientes={clientes}
          servicos={servicos}
          planos={planos}
          assinaturas={assinaturas}
          mostrarBarbeiro={barbeiroSelecionado === 'todos'}
        />
      </div>
    </div>
  )
}
