import Link from 'next/link'
import { CalendarClock } from 'lucide-react'
import type { Agendamento, Barbeiro, Servico } from '../../types'
import { Card, EmptyState } from '../../components/ui'
import { formatDateDisplay, getHojeISO } from '../../lib/dateUtils'

export function NextAppointmentCard({
  proximo,
  barbeiros,
  servicos,
}: {
  proximo: Agendamento | undefined
  barbeiros: Barbeiro[]
  servicos: Servico[]
}) {
  if (!proximo) {
    return (
      <EmptyState
        icon={<CalendarClock size={22} />}
        title="Nenhum agendamento"
        description="Você ainda não tem um horário marcado."
      />
    )
  }

  const barbeiro = barbeiros.find((b) => b.id === proximo.barbeiroId)
  const servico = servicos.find((s) => s.id === proximo.servicoId)

  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center gap-2 text-brass">
        <CalendarClock size={18} aria-hidden="true" />
        <span className="text-xs tracking-wide uppercase">Próximo agendamento</span>
      </div>
      <p className="text-lg text-text-primary">{servico?.nome}</p>
      <p className="text-sm text-text-secondary">
        {formatDateDisplay(getHojeISO())} às {proximo.hora} · {barbeiro?.nome}
      </p>
      <Link
        href="/cliente/agendar"
        className="mt-3 inline-block rounded px-4 py-2 text-sm text-text-secondary hover:text-text-primary"
      >
        Agendar outro horário
      </Link>
    </Card>
  )
}
