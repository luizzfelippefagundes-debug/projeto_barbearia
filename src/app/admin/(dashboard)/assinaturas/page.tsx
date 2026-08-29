import { Card, EmptyState, SectionHeading } from '../../../../components/ui'
import { MetricCardsRow } from '../../../../components/assinaturas/MetricCardsRow'
import { DeclinedCardAlert } from '../../../../components/assinaturas/DeclinedCardAlert'
import { SubscriberList } from '../../../../components/assinaturas/SubscriberList'
import { PlanoFormModal } from '../../../../components/assinaturas/PlanoFormModal'
import { PlanoRowActions } from '../../../../components/assinaturas/PlanoRowActions'
import { PlanoResumoRow } from '../../../../components/servicos/PlanoResumoRow'
import { getAssinaturas, getPlanosAssinatura } from '../../../../db/queries/assinaturas'
import { getClientesResumo } from '../../../../db/queries/clientes'
import { getServicos } from '../../../../db/queries/servicos'

export default async function AssinaturasPage() {
  const [assinaturas, planos, clientes, servicos] = await Promise.all([
    getAssinaturas(),
    getPlanosAssinatura(),
    getClientesResumo(),
    getServicos(),
  ])

  return (
    <div className="flex flex-col gap-8">
      <div>
        <SectionHeading>Assinaturas</SectionHeading>
        <MetricCardsRow assinaturas={assinaturas} planos={planos} />
      </div>

      <div>
        <SectionHeading action={<PlanoFormModal servicos={servicos} />}>Planos</SectionHeading>
        {planos.length === 0 ? (
          <EmptyState title="Nenhum plano cadastrado" description="Crie o primeiro plano acima." />
        ) : (
          <Card>
            {planos.map((plano) => (
              <PlanoResumoRow
                key={plano.id}
                plano={plano}
                actions={<PlanoRowActions plano={plano} servicos={servicos} />}
              />
            ))}
          </Card>
        )}
      </div>

      <div>
        <SectionHeading>Clientes</SectionHeading>
        <DeclinedCardAlert assinaturas={assinaturas} clientes={clientes} />
        <SubscriberList assinaturas={assinaturas} clientes={clientes} planos={planos} />
      </div>
    </div>
  )
}
