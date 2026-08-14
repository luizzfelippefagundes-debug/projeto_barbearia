import { eq } from 'drizzle-orm'
import { getDb } from '../index'
import { configuracoes } from '../schema'

export async function getMetaFaturamentoMensal(): Promise<number | null> {
  const rows = await getDb()
    .select()
    .from(configuracoes)
    .where(eq(configuracoes.id, 'default'))
    .limit(1)
  return rows[0]?.metaFaturamentoMensal ?? null
}
