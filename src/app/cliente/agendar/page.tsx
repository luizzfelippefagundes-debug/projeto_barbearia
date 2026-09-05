import { BookingFlowClient } from '../../../components/booking/BookingFlowClient'
import { ClienteDatePicker } from '../../../components/booking/ClienteDatePicker'
import { requireClienteAtual } from '../../../lib/clienteAuth'
import { getBarbeiros } from '../../../db/queries/barbeiros'
import { getServicosAtivos } from '../../../db/queries/servicos'
import { getGradeAgendaDoDia } from '../../../db/queries/agendamentos'
import { getAssinaturas, getPlanosAssinatura } from '../../../db/queries/assinaturas'
import { addDays, getHojeISO, TIME_SLOTS } from '../../../lib/dateUtils'

/** Cliente só pode agendar hoje + os próximos 6 dias (7 dias no total). */
const JANELA_DIAS_AGENDAMENTO = 6

export default async function AgendarPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string }>
}) {
  const cliente = await requireClienteAtual()
  const hojeISO = getHojeISO()
  const maxData = addDays(hojeISO, JANELA_DIAS_AGENDAMENTO)

  const { data } = await searchParams
  const dataSolicitada = data || hojeISO
  const dataISO = dataSolicitada < hojeISO || dataSolicitada > maxData ? hojeISO : dataSolicitada

  const [barbeiros, servicos, assinaturas, planos] = await Promise.all([
    getBarbeiros(),
    getServicosAtivos(),
    getAssinaturas(),
    getPlanosAssinatura(),
  ])

  const barbeirosAtivos = barbeiros.filter((b) => b.ativo)
  const grade = await getGradeAgendaDoDia(dataISO, barbeirosAtivos.map((b) => b.id), TIME_SLOTS)

  const assinatura = assinaturas.find((a) => a.clienteId === cliente.id && a.status !== 'cancelado')
  const plano = assinatura ? planos.find((p) => p.id === assinatura.planoId) : undefined

  return (
    <div className="lg:mx-auto lg:max-w-3xl">
      <ClienteDatePicker dataISO={dataISO} maxData={maxData} />
      <BookingFlowClient
        servicos={servicos}
        barbeiros={barbeirosAtivos}
        grade={grade}
        dataISO={dataISO}
        cliente={cliente}
        assinatura={assinatura}
        plano={plano}
      />
    </div>
  )
}
