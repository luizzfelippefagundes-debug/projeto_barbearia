import { SectionHeading } from '../../../../components/ui'
import { MetricCardsRow } from '../../../../components/assinaturas/MetricCardsRow'
import { DeclinedCardAlert } from '../../../../components/assinaturas/DeclinedCardAlert'
import { SubscriberList } from '../../../../components/assinaturas/SubscriberList'
import { NovoPlanoButton } from '../../../../components/assinaturas/NovoPlanoButton'
import { getAssinaturas, getPlanosAssinatura } from '../../../../db/queries/assinaturas'
import { getClientesResumo } from '../../../../db/queries/clientes'
import { getServicosAtivos } from '../../../../db/queries/servicos'

export default async function AssinaturasPage() {
  const [assinaturas, planos, clientes, servicos] = await Promise.all([
    getAssinaturas(),
    getPlanosAssinatura(),
    getClientesResumo(),
    getServicosAtivos(),
  ])

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading action={<NovoPlanoButton servicos={servicos} />}>Assinaturas</SectionHeading>
      <MetricCardsRow assinaturas={assinaturas} planos={planos} />
      <DeclinedCardAlert assinaturas={assinaturas} clientes={clientes} />
      <SubscriberList assinaturas={assinaturas} clientes={clientes} planos={planos} />
    </div>
  )
}
