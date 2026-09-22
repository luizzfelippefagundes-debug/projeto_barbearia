'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getDb } from '../db'
import { servicos } from '../db/schema'
import { assertAdmin } from '../lib/adminAuth'

function revalidarTelasDeServico() {
  revalidatePath('/admin/servicos')
  revalidatePath('/admin/agenda')
  revalidatePath('/admin/barbeiros')
  revalidatePath('/cliente/agendar')
}

/** Ações desse arquivo devolvem `{ error }` em vez de lançar exceção nas
 * validações — em produção, o Next.js esconde a mensagem de erros
 * lançados numa Server Action, então a única forma confiável do cliente
 * ver a mensagem certa é como dado de retorno normal. */
export async function criarServico(
  nome: string,
  duracaoMin: number,
  precoAvulso: number,
): Promise<{ error: string } | (typeof servicos.$inferSelect)> {
  const dono = await assertAdmin()
  if (!nome.trim()) return { error: 'Nome é obrigatório' }

  const rows = await getDb()
    .insert(servicos)
    .values({
      barbeariaId: dono.barbeariaId,
      nome: nome.trim(),
      duracaoMin: Math.max(5, Math.round(duracaoMin)),
      precoAvulso,
    })
    .returning()

  revalidarTelasDeServico()
  return rows[0]
}

export async function atualizarServico(
  id: string,
  nome: string,
  duracaoMin: number,
  precoAvulso: number,
): Promise<{ error: string } | (typeof servicos.$inferSelect)> {
  const dono = await assertAdmin()
  if (!nome.trim()) return { error: 'Nome é obrigatório' }

  const rows = await getDb()
    .update(servicos)
    .set({
      nome: nome.trim(),
      duracaoMin: Math.max(5, Math.round(duracaoMin)),
      precoAvulso,
    })
    .where(and(eq(servicos.id, id), eq(servicos.barbeariaId, dono.barbeariaId)))
    .returning()

  revalidarTelasDeServico()
  return rows[0]
}

export async function toggleServicoAtivo(id: string, ativo: boolean) {
  const dono = await assertAdmin()
  await getDb()
    .update(servicos)
    .set({ ativo })
    .where(and(eq(servicos.id, id), eq(servicos.barbeariaId, dono.barbeariaId)))
  revalidarTelasDeServico()
}
