import type { StatusAgendamento } from './common'

export interface Agendamento {
  id: string
  data: string
  hora: string
  clienteId?: string
  barbeiroId: string
  servicoId?: string
  status: StatusAgendamento
}

export interface FilaEsperaEntry {
  id: string
  clienteId: string
  desejaBarbeiroId?: string
  desejaServicoId?: string
  criadoEm: string
  notificado: boolean
}
