import type { FilaEsperaEntry } from '../types'
import { BARBEIRO_IDS, CLIENTE_IDS, SERVICO_IDS } from './ids'

export const filaEspera: FilaEsperaEntry[] = [
  {
    id: 'fila_1',
    clienteId: CLIENTE_IDS.RAFAEL,
    desejaBarbeiroId: BARBEIRO_IDS.BETO,
    desejaServicoId: SERVICO_IDS.CORTE_DEGRADE,
    criadoEm: '2026-08-12T08:10:00',
    notificado: false,
  },
  {
    id: 'fila_2',
    clienteId: CLIENTE_IDS.THIAGO,
    desejaServicoId: SERVICO_IDS.CORTE_SIMPLES,
    criadoEm: '2026-08-12T08:40:00',
    notificado: false,
  },
  {
    id: 'fila_3',
    clienteId: CLIENTE_IDS.ANDRE,
    desejaBarbeiroId: BARBEIRO_IDS.IGOR,
    criadoEm: '2026-08-12T09:05:00',
    notificado: true,
  },
]
