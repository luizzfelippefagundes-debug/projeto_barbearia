import type { StatusPayout } from './common'

export interface Barbeiro {
  id: string
  nome: string
  avatarUrl?: string
  comissaoPercent: number
  ativo: boolean
  produtoMaisVendidoId?: string
}

export interface PayoutBarbeiro {
  id: string
  barbeiroId: string
  mesReferencia: string
  valor: number
  status: StatusPayout
  dataTransferencia?: string
}
