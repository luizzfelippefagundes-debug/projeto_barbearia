import type { Servico } from '../types'
import { SERVICO_IDS } from './ids'

export const servicos: Servico[] = [
  {
    id: SERVICO_IDS.CORTE_SIMPLES,
    nome: 'Corte Simples',
    duracaoMin: 30,
    precoAvulso: 45,
  },
  {
    id: SERVICO_IDS.CORTE_DEGRADE,
    nome: 'Corte Degradê',
    duracaoMin: 40,
    precoAvulso: 55,
  },
  {
    id: SERVICO_IDS.CORTE_BARBA,
    nome: 'Corte + Barba',
    duracaoMin: 50,
    precoAvulso: 75,
  },
  {
    id: SERVICO_IDS.BARBA,
    nome: 'Barba',
    duracaoMin: 25,
    precoAvulso: 35,
  },
  {
    id: SERVICO_IDS.SOBRANCELHA,
    nome: 'Sobrancelha',
    duracaoMin: 10,
    precoAvulso: 15,
  },
  {
    id: SERVICO_IDS.PEZINHO,
    nome: 'Pézinho',
    duracaoMin: 15,
    precoAvulso: 20,
  },
]
