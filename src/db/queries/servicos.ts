import { eq } from 'drizzle-orm'
import { getDb } from '../index'
import { servicos } from '../schema'

export async function getServicosAtivos() {
  return getDb().select().from(servicos).where(eq(servicos.ativo, true)).orderBy(servicos.nome)
}
