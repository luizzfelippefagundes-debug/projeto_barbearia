import type { Assinatura, PlanoAssinatura } from '../types'
import { CLIENTE_IDS, PLANO_IDS } from './ids'

export const planosAssinatura: PlanoAssinatura[] = [
  {
    id: PLANO_IDS.MENSAL_1,
    nome: 'Plano Corte Único',
    valorMensal: 79,
    cortesInclusos: 1,
  },
  {
    id: PLANO_IDS.MENSAL_2,
    nome: 'Plano Corte Duplo',
    valorMensal: 129,
    cortesInclusos: 2,
  },
  {
    id: PLANO_IDS.ILIMITADO,
    nome: 'Plano Ilimitado',
    valorMensal: 189,
    cortesInclusos: 'ilimitado',
  },
]

export const assinaturas: Assinatura[] = [
  {
    id: 'assin_joao',
    clienteId: CLIENTE_IDS.JOAO,
    planoId: PLANO_IDS.MENSAL_2,
    status: 'em_dia',
    proximaCobranca: '2026-08-20',
  },
  {
    id: 'assin_marcos',
    clienteId: CLIENTE_IDS.MARCOS,
    planoId: PLANO_IDS.MENSAL_1,
    status: 'atrasado',
    proximaCobranca: '2026-08-05',
    cartaoRecusado: true,
  },
  {
    id: 'assin_lucas',
    clienteId: CLIENTE_IDS.LUCAS,
    planoId: PLANO_IDS.ILIMITADO,
    status: 'em_dia',
    proximaCobranca: '2026-08-25',
  },
  {
    id: 'assin_bruno',
    clienteId: CLIENTE_IDS.BRUNO,
    planoId: PLANO_IDS.MENSAL_2,
    status: 'em_dia',
    proximaCobranca: '2026-08-18',
  },
  {
    id: 'assin_gabriel',
    clienteId: CLIENTE_IDS.GABRIEL,
    planoId: PLANO_IDS.MENSAL_1,
    status: 'aguardando',
    proximaCobranca: '2026-08-14',
  },
  {
    id: 'assin_vinicius',
    clienteId: CLIENTE_IDS.VINICIUS,
    planoId: PLANO_IDS.ILIMITADO,
    status: 'atrasado',
    proximaCobranca: '2026-08-02',
    cartaoRecusado: true,
  },
]
