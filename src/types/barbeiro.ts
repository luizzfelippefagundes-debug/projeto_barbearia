import type { PapelBarbeiro, StatusPayout } from './common'

export interface Barbeiro {
  id: string
  nome: string
  avatarUrl?: string
  comissaoPercent: number
  papel: PapelBarbeiro
  ativo: boolean
}

export interface PayoutBarbeiro {
  id: string
  barbeiroId: string
  mesReferencia: string
  valor: number
  status: StatusPayout
  dataTransferencia?: string
}
