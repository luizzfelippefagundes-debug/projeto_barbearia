import type { Agendamento, Barbeiro, Cliente, Servico } from '../../types'
import { Card, EmptyState } from '../../components/ui'
import { ScheduleRow } from './ScheduleRow'

interface ScheduleListProps {
  agendamentos: Agendamento[]
  barbeiros: Barbeiro[]
  clientes: Cliente[]
  servicos: Servico[]
}

export function ScheduleList({ agendamentos, barbeiros, clientes, servicos }: ScheduleListProps) {
  if (agendamentos.length === 0) {
    return (
      <EmptyState
        title="Nenhum barbeiro cadastrado"
        description="Cadastre um barbeiro para começar a montar a agenda."
      />
    )
  }

  const ordenados = [...agendamentos].sort((a, b) => a.hora.localeCompare(b.hora))

  return (
    <Card>
      {ordenados.map((agendamento) => (
        <ScheduleRow
          key={agendamento.id}
          agendamento={agendamento}
          barbeiros={barbeiros}
          clientes={clientes}
          servicos={servicos}
        />
      ))}
    </Card>
  )
}
