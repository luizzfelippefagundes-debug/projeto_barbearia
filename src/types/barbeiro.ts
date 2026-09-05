import type { PapelBarbeiro, StatusPayout } from './common'

export interface Barbeiro {
  id: string
  nome: string
  telefone?: string
  avatarUrl?: string
  papel: PapelBarbeiro
  ativo: boolean
  /** true = ainda não fez o primeiro login pra ligar a conta */
  convitePendente: boolean
  /** Dias que ele trabalha (0=domingo..6=sábado) — filtra o agendamento
   * do cliente, não a agenda própria dele. */
  diasTrabalho: number[]
  horaInicio: string
  horaFim: string
}

export interface PayoutBarbeiro {
  id: string
  barbeiroId: string
  mesReferencia: string
  valor: number
  status: StatusPayout
  dataTransferencia?: string
}
