import type { Agendamento } from '../types'

export type AgendaRowItem =
  | { type: 'agendamento'; agendamento: Agendamento }
  | { type: 'livres'; agendamentos: Agendamento[] }
  | { type: 'continuacao'; agendamentos: Agendamento[] }

/** Agrupa livres consecutivos (ver LivreGroup) e também as linhas de
 * "continuação do horário anterior" de um mesmo agendamento longo — um
 * serviço de 115min gerava 7 linhas idênticas empilhadas, o que mais
 * atrapalhava do que ajudava a ler a agenda. Com isso vira 1 linha
 * resumida ("ocupado até HH:MM"), igual já funciona pros livres. */
export function agruparLivres(agendamentos: Agendamento[]): AgendaRowItem[] {
  const items: AgendaRowItem[] = []
  let livreBuffer: Agendamento[] = []
  let continuacaoBuffer: Agendamento[] = []

  function fecharLivres() {
    if (livreBuffer.length > 0) {
      items.push({ type: 'livres', agendamentos: livreBuffer })
      livreBuffer = []
    }
  }
  function fecharContinuacao() {
    if (continuacaoBuffer.length > 0) {
      items.push({ type: 'continuacao', agendamentos: continuacaoBuffer })
      continuacaoBuffer = []
    }
  }

  for (const a of agendamentos) {
    if (a.status === 'livre') {
      fecharContinuacao()
      livreBuffer.push(a)
      continue
    }
    if (a.continuacaoDeId) {
      fecharLivres()
      const ultimo = continuacaoBuffer[continuacaoBuffer.length - 1]
      if (ultimo && ultimo.continuacaoDeId !== a.continuacaoDeId) fecharContinuacao()
      continuacaoBuffer.push(a)
      continue
    }
    fecharLivres()
    fecharContinuacao()
    items.push({ type: 'agendamento', agendamento: a })
  }
  fecharLivres()
  fecharContinuacao()
  return items
}
