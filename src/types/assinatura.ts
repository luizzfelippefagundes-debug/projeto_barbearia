import type { StatusPagamento } from './common'

export interface PlanoAssinatura {
  id: string
  nome: string
  valorMensal: number
  cortesInclusos: number | 'ilimitado'
}

export interface Assinatura {
  id: string
  clienteId: string
  planoId: string
  status: StatusPagamento
  proximaCobranca: string
  cartaoRecusado?: boolean
  ultimoReenvioEm?: string
  asaasSubscriptionId?: string
  asaasFirstPaymentId?: string
  criadoEm: string
}
