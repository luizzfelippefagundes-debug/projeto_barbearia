import { and, eq } from 'drizzle-orm'
import { getDb } from '../index'
import { produtos } from '../schema'
import type { Produto } from '../../types'

function toAppProduto(row: typeof produtos.$inferSelect): Produto {
  return {
    id: row.id,
    nome: row.nome,
    precoVenda: row.precoVenda,
    estoque: row.estoque,
    estoqueMinimo: row.estoqueMinimo,
    categoria: row.categoria,
  }
}

export async function getProdutosAtivos(barbeariaId: string): Promise<Produto[]> {
  const rows = await getDb()
    .select()
    .from(produtos)
    .where(and(eq(produtos.barbeariaId, barbeariaId), eq(produtos.ativo, true)))
    .orderBy(produtos.nome)
  return rows.map(toAppProduto)
}
