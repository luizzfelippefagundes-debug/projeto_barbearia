import { eq } from 'drizzle-orm'
import { getDb } from '../index'
import { clientes } from '../schema'

export async function getClienteRowByClerkId(clerkUserId: string) {
  const rows = await getDb().select().from(clientes).where(eq(clientes.clerkUserId, clerkUserId)).limit(1)
  return rows[0] ?? null
}

export async function criarClienteComClerkId(clerkUserId: string, nome: string, telefone: string) {
  const rows = await getDb()
    .insert(clientes)
    .values({ clerkUserId, nome, telefone })
    .returning()
  return rows[0]
}
