import { Card, EmptyState, SectionHeading } from '../../components/ui'
import { useAppData } from '../../state/useAppData'
import { WaitlistRow } from './WaitlistRow'

export function WaitlistSection() {
  const { state } = useAppData()

  return (
    <div>
      <SectionHeading>Fila de espera</SectionHeading>
      {state.filaEspera.length === 0 ? (
        <EmptyState title="Fila vazia" description="Nenhum cliente aguardando vaga." />
      ) : (
        <Card>
          {state.filaEspera.map((entrada) => (
            <WaitlistRow key={entrada.id} entrada={entrada} />
          ))}
        </Card>
      )}
    </div>
  )
}
