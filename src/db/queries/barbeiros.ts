import { eq } from 'drizzle-orm'
import { getDb } from '../index'
import { barbeiros } from '../schema'

export async function getBarbeiros() {
  return getDb().select().from(barbeiros).orderBy(barbeiros.nome)
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
