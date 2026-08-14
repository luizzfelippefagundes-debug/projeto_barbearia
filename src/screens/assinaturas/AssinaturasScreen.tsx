import { SectionHeading } from '../../components/ui'
import { MetricCardsRow } from './MetricCardsRow'
import { DeclinedCardAlert } from './DeclinedCardAlert'
import { SubscriberList } from './SubscriberList'

export function AssinaturasScreen() {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeading>Assinaturas</SectionHeading>
      <MetricCardsRow />
      <DeclinedCardAlert />
      <SubscriberList />
    </div>
  )
}
