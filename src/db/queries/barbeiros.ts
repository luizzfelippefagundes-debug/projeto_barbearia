import { eq } from 'drizzle-orm'
import { getDb } from '../index'
import { barbeiros } from '../schema'
import { nullToUndefined } from '../../lib/db-map'
import type { Barbeiro } from '../../types'

function toAppBarbeiro(row: typeof barbeiros.$inferSelect): Barbeiro {
  return {
    id: row.id,
    nome: row.nome,
    avatarUrl: nullToUndefined(row.avatarUrl),
    comissaoPercent: row.comissaoPercent,
    ativo: row.ativo,
  }
}

export async function getBarbeiros(): Promise<Barbeiro[]> {
  const rows = await getDb().select().from(barbeiros).orderBy(barbeiros.nome)
  return rows.map(toAppBarbeiro)
}

export async function getBarbeiroByClerkId(clerkUserId: string) {
  const rows = await getDb()
    .select()
    .from(barbeiros)
    .where(eq(barbeiros.clerkUserId, clerkUserId))
    .limit(1)
  return rows[0] ?? null
}

export async function countBarbeiros(): Promise<number> {
  const rows = await getDb().select({ id: barbeiros.id }).from(barbeiros)
  return rows.length
}

export async function criarBarbeiroComClerkId(clerkUserId: string, nome: string) {
  const rows = await getDb()
    .insert(barbeiros)
    .values({ clerkUserId, nome, comissaoPercent: 40 })
    .returning()
  return rows[0]
}
