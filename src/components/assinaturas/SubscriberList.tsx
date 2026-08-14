import type { Assinatura, Cliente, PlanoAssinatura } from '../../types'
import { Card, EmptyState } from '../../components/ui'
import { SubscriberRow } from './SubscriberRow'

export function SubscriberList({
  assinaturas,
  clientes,
  planos,
}: {
  assinaturas: Assinatura[]
  clientes: Cliente[]
  planos: PlanoAssinatura[]
}) {
  if (assinaturas.length === 0) {
    return <EmptyState title="Nenhum assinante" description="Ainda não há assinaturas cadastradas." />
  }

  return (
    <Card>
      {assinaturas.map((assinatura) => (
        <SubscriberRow
          key={assinatura.id}
          assinatura={assinatura}
          cliente={clientes.find((c) => c.id === assinatura.clienteId)}
          plano={planos.find((p) => p.id === assinatura.planoId)}
        />
      ))}
    </Card>
  )
}
