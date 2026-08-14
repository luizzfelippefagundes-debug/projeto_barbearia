import { Avatar } from '../../../components/ui'
import { ClienteLoyaltyProgress } from '../../../components/clientes/ClienteLoyaltyProgress'
import { ClienteVisitHistory } from '../../../components/clientes/ClienteVisitHistory'
import { NextAppointmentCard } from '../../../components/perfil/NextAppointmentCard'
import { IndicarAmigoButton } from '../../../components/perfil/IndicarAmigoButton'
import { SubscriptionCancelFlow } from '../../../components/perfil/SubscriptionCancelFlow'
import { requireClienteAtual } from '../../../lib/clienteAuth'
import { getBarbeiros } from '../../../db/queries/barbeiros'
import { getServicosAtivos } from '../../../db/queries/servicos'
import { getAgendamentosDoDia } from '../../../db/queries/agendamentos'
import { getAssinaturas, getPlanosAssinatura } from '../../../db/queries/assinaturas'
import { getClientesResumo } from '../../../db/queries/clientes'
import { getHojeISO } from '../../../lib/dateUtils'

export default async function PerfilPage() {
  const cliente = await requireClienteAtual()

  const [barbeiros, servicos, agendamentosHoje, assinaturas, planos, clientes] = await Promise.all([
    getBarbeiros(),
    getServicosAtivos(),
    getAgendamentosDoDia(getHojeISO()),
    getAssinaturas(),
    getPlanosAssinatura(),
    getClientesResumo(),
  ])

  const proximo = agendamentosHoje
    .filter((a) => a.clienteId === cliente.id && a.status === 'confirmado')
    .sort((a, b) => a.hora.localeCompare(b.hora))[0]

  const assinatura = assinaturas.find((a) => a.clienteId === cliente.id && a.status !== 'cancelado')
  const plano = assinatura ? planos.find((p) => p.id === assinatura.planoId) : undefined

  const totalIndicados = clientes.filter((c) => c.indicadoPor === cliente.id).length

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Avatar nome={cliente.nome} src={cliente.avatarUrl} size="lg" />
        <div>
          <h1 className="text-xl text-text-primary">{cliente.nome}</h1>
          <p className="text-xs text-text-secondary">{cliente.telefone}</p>
        </div>
      </div>

      <NextAppointmentCard proximo={proximo} barbeiros={barbeiros} servicos={servicos} />

      <ClienteLoyaltyProgress cliente={cliente} />

      {assinatura && plano && <SubscriptionCancelFlow assinatura={assinatura} plano={plano} />}

      <IndicarAmigoButton nome={cliente.nome} totalIndicados={totalIndicados} />

      <div>
        <p className="mb-2 text-xs text-text-secondary">Histórico</p>
        <ClienteVisitHistory historico={cliente.historico} barbeiros={barbeiros} servicos={servicos} />
      </div>
    </div>
  )
}
