import type { Barbeiro, PayoutBarbeiro } from '../types'
import { BARBEIRO_IDS, PRODUTO_IDS } from './ids'

export const barbeiros: Barbeiro[] = [
  {
    id: BARBEIRO_IDS.BETO,
    nome: 'Beto Amaral',
    comissaoPercent: 45,
    ativo: true,
    produtoMaisVendidoId: PRODUTO_IDS.POMADA_MATTE,
  },
  {
    id: BARBEIRO_IDS.CAUA,
    nome: 'Cauã Silveira',
    comissaoPercent: 50,
    ativo: true,
    produtoMaisVendidoId: PRODUTO_IDS.OLEO_BARBA,
  },
  {
    id: BARBEIRO_IDS.RENAN,
    nome: 'Renan Costa',
    comissaoPercent: 35,
    ativo: true,
    produtoMaisVendidoId: PRODUTO_IDS.CERA,
  },
  {
    id: BARBEIRO_IDS.IGOR,
    nome: 'Igor Nascimento',
    comissaoPercent: 60,
    ativo: true,
    produtoMaisVendidoId: PRODUTO_IDS.POMADA_MATTE,
  },
]

export const payoutsBarbeiros: PayoutBarbeiro[] = [
  {
    id: 'payout_beto_08',
    barbeiroId: BARBEIRO_IDS.BETO,
    mesReferencia: '2026-08',
    valor: 1863,
    status: 'transferido',
    dataTransferencia: '2026-08-05',
  },
  {
    id: 'payout_caua_08',
    barbeiroId: BARBEIRO_IDS.CAUA,
    mesReferencia: '2026-08',
    valor: 2210,
    status: 'pendente',
  },
  {
    id: 'payout_renan_08',
    barbeiroId: BARBEIRO_IDS.RENAN,
    mesReferencia: '2026-08',
    valor: 987,
    status: 'transferido',
    dataTransferencia: '2026-08-05',
  },
  {
    id: 'payout_igor_08',
    barbeiroId: BARBEIRO_IDS.IGOR,
    mesReferencia: '2026-08',
    valor: 2604,
    status: 'pendente',
  },
]
