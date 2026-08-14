import { Avatar } from '../../../components/ui'
import { useAppData } from '../../../state/useAppData'
import { CLIENTE_ATUAL_ID } from '../../../lib/constants'
import { ClienteLoyaltyProgress } from '../../clientes/ClienteLoyaltyProgress'
import { ClienteVisitHistory } from '../../clientes/ClienteVisitHistory'
import { NextAppointmentCard } from './NextAppointmentCard'
import { IndicarAmigoButton } from './IndicarAmigoButton'
import { SubscriptionCancelFlow } from './SubscriptionCancelFlow'

export function PerfilScreen() {
  const { state } = useAppData()
  const cliente = state.clientes.find((c) => c.id === CLIENTE_ATUAL_ID)

  if (!cliente) return null

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Avatar nome={cliente.nome} src={cliente.avatarUrl} size="lg" />
        <div>
          <h1 className="text-xl text-text-primary">{cliente.nome}</h1>
          <p className="text-xs text-text-secondary">{cliente.telefone}</p>
        </div>
      </div>

      <NextAppointmentCard />

      <ClienteLoyaltyProgress cliente={cliente} />

      <SubscriptionCancelFlow />

      <IndicarAmigoButton />

      <div>
        <p className="mb-2 text-xs text-text-secondary">Histórico</p>
        <ClienteVisitHistory historico={cliente.historico} />
      </div>
    </div>
  )
}
