import type { CanalIndicacao, ThumbUpDown } from './common'

export interface HaircutRecord {
  id: string
  data: string
  barbeiroId: string
  servicoId: string
  fotoUrl?: string
  notas?: string
  avaliacao?: ThumbUpDown
  /** true = agendamento vencido ainda não confirmado pelo barbeiro, exibido
   * como se fosse atendido (mesma regra do faturamento) — não existe
   * haircut_record de verdade por trás, então não pode ser avaliado. */
  pendente?: boolean
}

export interface Cliente {
  id: string
  barbeariaId: string
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
