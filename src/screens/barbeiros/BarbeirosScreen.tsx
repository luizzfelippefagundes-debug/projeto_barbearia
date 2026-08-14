import { useAppData } from '../../state/useAppData'
import { SectionHeading } from '../../components/ui'
import { BarbeiroCard } from './BarbeiroCard'

export function BarbeirosScreen() {
  const { state } = useAppData()

  return (
    <div>
      <SectionHeading>Barbeiros e comissão</SectionHeading>
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
      >
        {state.barbeiros.map((barbeiro) => (
          <BarbeiroCard
            key={barbeiro.id}
            barbeiro={barbeiro}
            payout={state.payoutsBarbeiros.find((p) => p.barbeiroId === barbeiro.id)}
          />
        ))}
      </div>
    </div>
  )
}
