import type { Produto } from '../types'
import { PRODUTO_IDS } from './ids'

export const produtos: Produto[] = [
  {
    id: PRODUTO_IDS.POMADA_MATTE,
    nome: 'Pomada Matte',
    precoVenda: 42,
    estoque: 18,
    estoqueMinimo: 8,
    categoria: 'Finalização',
  },
  {
    id: PRODUTO_IDS.OLEO_BARBA,
    nome: 'Óleo para Barba',
    precoVenda: 38,
    estoque: 5,
    estoqueMinimo: 6,
    categoria: 'Barba',
  },
  {
    id: PRODUTO_IDS.SHAMPOO,
    nome: 'Shampoo Anticaspa',
    precoVenda: 29,
    estoque: 22,
    estoqueMinimo: 10,
    categoria: 'Cuidado',
  },
  {
    id: PRODUTO_IDS.BALM,
    nome: 'Balm Pós-Barba',
    precoVenda: 35,
    estoque: 3,
    estoqueMinimo: 5,
    categoria: 'Barba',
  },
  {
    id: PRODUTO_IDS.CERA,
    nome: 'Cera Modeladora',
    precoVenda: 33,
    estoque: 14,
    estoqueMinimo: 8,
    categoria: 'Finalização',
  },
  {
    id: PRODUTO_IDS.PENTE,
    nome: 'Pente de Madeira',
    precoVenda: 18,
    estoque: 9,
    estoqueMinimo: 5,
    categoria: 'Acessório',
  },
]
