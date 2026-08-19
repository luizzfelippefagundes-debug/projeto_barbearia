import type { StatusPagamento } from './common'

export interface PlanoServicoInclusao {
  servicoId: string
  nome: string
  /** null = sem limite dentro do plano (ex: cabelo/barba/pezinho); um número
   * significa "até N vezes por mês" (ex: barboterapia do VIP, 4x/mês). */
  limiteMensal: number | null
}

export interface PlanoAssinatura {
  id: string
  nome: string
  valorMensal: number
  ativo: boolean
  servicosInclusos: PlanoServicoInclusao[]
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
