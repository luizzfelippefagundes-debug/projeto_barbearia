import { eq } from 'drizzle-orm'
import { getDb } from '../index'
import { clientes } from '../schema'
import { gerarCodigoIndicacao } from '../../lib/codigoIndicacao'

export async function getClienteRowByClerkId(clerkUserId: string) {
  const rows = await getDb().select().from(clientes).where(eq(clientes.clerkUserId, clerkUserId)).limit(1)
  return rows[0] ?? null
}

export async function criarClienteComClerkId(
  clerkUserId: string,
  nome: string,
  telefone: string,
  indicadoPor?: string,
) {
  const db = getDb()
  for (let tentativa = 0; tentativa < 5; tentativa++) {
    try {
      const rows = await db
        .insert(clientes)
        .values({ clerkUserId, nome, telefone, indicadoPor, codigoIndicacao: gerarCodigoIndicacao() })
        .returning()
      return rows[0]
    } catch (err) {
      // colisão rara de código único — tenta de novo com outro código
      if (tentativa === 4) throw err
    }
  }
  throw new Error('Não foi possível criar o cliente')
}
