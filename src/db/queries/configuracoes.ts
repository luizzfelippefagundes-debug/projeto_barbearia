import { eq } from 'drizzle-orm'
import { getDb } from '../index'
import { configuracoes } from '../schema'

export async function getMetaFaturamentoMensal(barbeariaId: string): Promise<number | null> {
  const rows = await getDb()
    .select()
    .from(configuracoes)
    .where(eq(configuracoes.barbeariaId, barbeariaId))
    .limit(1)
  return rows[0]?.metaFaturamentoMensal ?? null
}
