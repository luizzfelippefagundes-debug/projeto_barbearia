import type { Agendamento } from '../types'

export type AgendaRowItem =
  | { type: 'agendamento'; agendamento: Agendamento }
  | { type: 'livres'; agendamentos: Agendamento[] }

export function agruparLivres(agendamentos: Agendamento[]): AgendaRowItem[] {
  const items: AgendaRowItem[] = []
  let livreBuffer: Agendamento[] = []

  for (const a of agendamentos) {
    if (a.status === 'livre') {
      livreBuffer.push(a)
    } else {
      if (livreBuffer.length > 0) {
        items.push({ type: 'livres', agendamentos: livreBuffer })
        livreBuffer = []
      }
      items.push({ type: 'agendamento', agendamento: a })
    }
  }
  if (livreBuffer.length > 0) {
    items.push({ type: 'livres', agendamentos: livreBuffer })
  }
  return items
}
