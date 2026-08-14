import { CalendarClock } from 'lucide-react'
import { Button, Card, EmptyState } from '../../../components/ui'
import { useAppData } from '../../../state/useAppData'
import { HOJE_ISO, formatDateDisplay } from '../../../lib/dateUtils'
import { CLIENTE_ATUAL_ID } from '../../../lib/constants'
import { useNavigate } from 'react-router-dom'

export function NextAppointmentCard() {
  const { state, agendamentosDoDia } = useAppData()
  const navigate = useNavigate()

  const proximo = agendamentosDoDia(HOJE_ISO)
    .filter((a) => a.clienteId === CLIENTE_ATUAL_ID && a.status === 'confirmado')
    .sort((a, b) => a.hora.localeCompare(b.hora))[0]

  if (!proximo) {
    return (
      <EmptyState
        icon={<CalendarClock size={22} />}
        title="Nenhum agendamento"
        description="Você ainda não tem um horário marcado."
      />
    )
  }

  const barbeiro = state.barbeiros.find((b) => b.id === proximo.barbeiroId)
  const servico = state.servicos.find((s) => s.id === proximo.servicoId)

  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center gap-2 text-brass">
        <CalendarClock size={18} aria-hidden="true" />
        <span className="text-xs tracking-wide uppercase">Próximo agendamento</span>
      </div>
      <p className="text-lg text-text-primary">{servico?.nome}</p>
      <p className="text-sm text-text-secondary">
        {formatDateDisplay(HOJE_ISO)} às {proximo.hora} · {barbeiro?.nome}
      </p>
      <Button size="sm" variant="ghost" className="mt-3" onClick={() => navigate('/cliente/agendar')}>
        Agendar outro horário
      </Button>
    </Card>
  )
}
