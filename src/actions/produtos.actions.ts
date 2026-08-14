'use server'

import { and, eq, gte, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getDb } from '../db'
import { produtos, vendas } from '../db/schema'
import { assertAdmin } from '../lib/adminAuth'
import { getHojeISO } from '../lib/dateUtils'

export async function registrarVenda(
  produtoId: string,
  barbeiroId: string,
  quantidade: number,
  clienteId?: string,
) {
  await assertAdmin()
  if (quantidade <= 0) throw new Error('Quantidade inválida')

  const db = getDb()

  const produto = (
    await db.select().from(produtos).where(eq(produtos.id, produtoId)).limit(1)
  )[0]
  if (!produto) throw new Error('Produto não encontrado')

  const qtd = Math.min(quantidade, produto.estoque)
  if (qtd <= 0) throw new Error('Sem estoque disponível')

  await db
    .update(produtos)
    .set({ estoque: sql`${produtos.estoque} - ${qtd}` })
    .where(and(eq(produtos.id, produtoId), gte(produtos.estoque, qtd)))

  await db.insert(vendas).values({
    produtoId,
    barbeiroId,
    clienteId: clienteId || null,
    quantidade: qtd,
    data: getHojeISO(),
    valorTotal: produto.precoVenda * qtd,
  })

  revalidatePath('/admin/produtos')
  revalidatePath('/admin/financeiro')
}

export async function criarProduto(
  nome: string,
  precoVenda: number,
  estoque: number,
  estoqueMinimo: number,
  categoria: string,
) {
  await assertAdmin()
  if (!nome.trim()) throw new Error('Nome é obrigatório')

  const rows = await getDb()
    .insert(produtos)
    .values({
      nome: nome.trim(),
      precoVenda,
      estoque: Math.max(0, Math.round(estoque)),
      estoqueMinimo: Math.max(0, Math.round(estoqueMinimo)),
      categoria: categoria.trim() || 'Geral',
    })
    .returning()

  revalidatePath('/admin/produtos')
  return rows[0]
}
