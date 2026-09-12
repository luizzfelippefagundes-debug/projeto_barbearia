import { and, eq } from 'drizzle-orm'
import { getDb } from '../index'
import { servicos } from '../schema'
import type { Servico } from '../../types'

function toAppServico(row: typeof servicos.$inferSelect): Servico {
  return {
    id: row.id,
    nome: row.nome,
    duracaoMin: row.duracaoMin,
    precoAvulso: row.precoAvulso,
    ativo: row.ativo,
  }
}

export async function getServicosAtivos(barbeariaId: string): Promise<Servico[]> {
  const rows = await getDb()
    .select()
    .from(servicos)
    .where(and(eq(servicos.barbeariaId, barbeariaId), eq(servicos.ativo, true)))
    .orderBy(servicos.nome)
  return rows.map(toAppServico)
}

export async function getServicos(barbeariaId: string): Promise<Servico[]> {
  const rows = await getDb().select().from(servicos).where(eq(servicos.barbeariaId, barbeariaId)).orderBy(servicos.nome)
  return rows.map(toAppServico)
}
