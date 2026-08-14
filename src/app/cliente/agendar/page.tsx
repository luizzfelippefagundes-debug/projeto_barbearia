import { BookingFlowClient } from '../../../components/booking/BookingFlowClient'
import { requireClienteAtual } from '../../../lib/clienteAuth'
import { getBarbeiros } from '../../../db/queries/barbeiros'
import { getServicosAtivos } from '../../../db/queries/servicos'
import { getGradeAgendaDoDia } from '../../../db/queries/agendamentos'
import { getAssinaturas, getPlanosAssinatura } from '../../../db/queries/assinaturas'
import { getHojeISO, TIME_SLOTS } from '../../../lib/dateUtils'

export default async function AgendarPage() {
  const cliente = await requireClienteAtual()
  const hojeISO = getHojeISO()

  const [barbeiros, servicos, assinaturas, planos] = await Promise.all([
    getBarbeiros(),
    getServicosAtivos(),
    getAssinaturas(),
    getPlanosAssinatura(),
  ])

  const barbeirosAtivos = barbeiros.filter((b) => b.ativo)
  const grade = await getGradeAgendaDoDia(hojeISO, barbeirosAtivos.map((b) => b.id), TIME_SLOTS)

  const assinatura = assinaturas.find((a) => a.clienteId === cliente.id && a.status !== 'cancelado')
  const plano = assinatura ? planos.find((p) => p.id === assinatura.planoId) : undefined

  return (
    <BookingFlowClient
      servicos={servicos}
      barbeiros={barbeirosAtivos}
      grade={grade}
      cliente={cliente}
      assinatura={assinatura}
      plano={plano}
    />
  )
}
