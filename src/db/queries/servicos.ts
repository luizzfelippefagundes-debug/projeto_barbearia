import { eq } from 'drizzle-orm'
import { getDb } from '../index'
import { servicos } from '../schema'
import type { Servico } from '../../types'

function toAppServico(row: typeof servicos.$inferSelect): Servico {
  return {
    id: row.id,
    nome: row.nome,
    duracaoMin: row.duracaoMin,
    precoAvulso: row.precoAvulso,
    incluidoNoPlano: row.incluidoNoPlano,
    ativo: row.ativo,
  }
}

export async function getServicosAtivos(): Promise<Servico[]> {
  const rows = await getDb().select().from(servicos).where(eq(servicos.ativo, true)).orderBy(servicos.nome)
  return rows.map(toAppServico)
}

export async function getServicos(): Promise<Servico[]> {
  const rows = await getDb().select().from(servicos).orderBy(servicos.nome)
  return rows.map(toAppServico)
}
