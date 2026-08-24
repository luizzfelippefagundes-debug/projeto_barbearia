import type { CanalIndicacao, ThumbUpDown } from './common'

export interface HaircutRecord {
  id: string
  data: string
  barbeiroId: string
  servicoId: string
  fotoUrl?: string
  notas?: string
  avaliacao?: ThumbUpDown
}

export interface Cliente {
  id: string
  nome: string
  telefone: string
  cpfCnpj?: string
  asaasCustomerId?: string
  avatarUrl?: string
  tags: string[]
  historico: HaircutRecord[]
  loyaltyCortesAtual: number
  loyaltyCortesMeta: number
  canalIndicacao: CanalIndicacao
  indicadoPor?: string
  codigoIndicacao?: string
  assinaturaId?: string
  criadoEm: string
}
