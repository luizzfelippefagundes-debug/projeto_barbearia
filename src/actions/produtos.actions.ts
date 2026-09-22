'use server'

import { and, eq, gte, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getDb } from '../db'
import { produtos, vendas } from '../db/schema'
import { assertAdmin } from '../lib/adminAuth'
import { getHojeISO } from '../lib/dateUtils'

/** Ações desse arquivo devolvem `{ error }` em vez de lançar exceção nas
 * validações — em produção, o Next.js esconde a mensagem de erros
 * lançados numa Server Action, então a única forma confiável do cliente
 * ver a mensagem certa é como dado de retorno normal. */
export async function registrarVenda(
  produtoId: string,
  barbeiroId: string,
  quantidade: number,
  clienteId?: string,
): Promise<{ error?: string }> {
  const dono = await assertAdmin()
  if (quantidade <= 0) return { error: 'Quantidade inválida' }

  const db = getDb()

  const produto = (
    await db
      .select()
      .from(produtos)
      .where(and(eq(produtos.id, produtoId), eq(produtos.barbeariaId, dono.barbeariaId)))
      .limit(1)
  )[0]
  if (!produto) return { error: 'Produto não encontrado' }

  const qtd = Math.min(quantidade, produto.estoque)
  if (qtd <= 0) return { error: 'Sem estoque disponível' }

  await db
    .update(produtos)
    .set({ estoque: sql`${produtos.estoque} - ${qtd}` })
    .where(and(eq(produtos.id, produtoId), gte(produtos.estoque, qtd)))

  await db.insert(vendas).values({
    barbeariaId: dono.barbeariaId,
    produtoId,
    barbeiroId,
    clienteId: clienteId || null,
    quantidade: qtd,
    data: getHojeISO(),
    valorTotal: produto.precoVenda * qtd,
  })

  revalidatePath('/admin/produtos')
  revalidatePath('/admin/financeiro')
  return {}
}

export async function criarProduto(
  nome: string,
  precoVenda: number,
  estoque: number,
  estoqueMinimo: number,
  categoria: string,
): Promise<{ error: string } | (typeof produtos.$inferSelect)> {
  const dono = await assertAdmin()
  if (!nome.trim()) return { error: 'Nome é obrigatório' }

  const rows = await getDb()
    .insert(produtos)
    .values({
      barbeariaId: dono.barbeariaId,
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
