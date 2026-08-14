import type { Agendamento } from '../../types'
import { Card, EmptyState } from '../../components/ui'
import { ScheduleRow } from './ScheduleRow'

export function ScheduleList({ agendamentos }: { agendamentos: Agendamento[] }) {
  if (agendamentos.length === 0) {
    return <EmptyState title="Sem horários" description="Nenhum horário cadastrado para este dia." />
  }

  const ordenados = [...agendamentos].sort((a, b) => a.hora.localeCompare(b.hora))

  return (
    <Card>
      {ordenados.map((agendamento) => (
        <ScheduleRow key={agendamento.id} agendamento={agendamento} />
      ))}
    </Card>
  )
}
