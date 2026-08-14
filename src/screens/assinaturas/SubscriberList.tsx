import { Card } from '../../components/ui'
import { useAppData } from '../../state/useAppData'
import { SubscriberRow } from './SubscriberRow'

export function SubscriberList() {
  const { state } = useAppData()

  return (
    <Card>
      {state.assinaturas.map((assinatura) => (
        <SubscriberRow key={assinatura.id} assinatura={assinatura} />
      ))}
    </Card>
  )
}
