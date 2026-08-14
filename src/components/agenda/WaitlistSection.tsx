import type { Barbeiro, Cliente, FilaEsperaEntry, Servico } from '../../types'
import { Card, EmptyState, SectionHeading } from '../../components/ui'
import { WaitlistRow } from './WaitlistRow'

interface WaitlistSectionProps {
  filaEspera: FilaEsperaEntry[]
  clientes: Cliente[]
  barbeiros: Barbeiro[]
  servicos: Servico[]
}

export function WaitlistSection({ filaEspera, clientes, barbeiros, servicos }: WaitlistSectionProps) {
  return (
    <div>
      <SectionHeading>Fila de espera</SectionHeading>
      {filaEspera.length === 0 ? (
        <EmptyState title="Fila vazia" description="Nenhum cliente aguardando vaga." />
      ) : (
        <Card>
          {filaEspera.map((entrada) => (
            <WaitlistRow
              key={entrada.id}
              entrada={entrada}
              clientes={clientes}
              barbeiros={barbeiros}
              servicos={servicos}
            />
          ))}
        </Card>
      )}
    </div>
  )
}
