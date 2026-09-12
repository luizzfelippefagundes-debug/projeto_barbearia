import { eq } from 'drizzle-orm'
import { getDb } from '../index'
import { barbeiros } from '../schema'
import { nullToUndefined } from '../../lib/db-map'
import type { Barbeiro } from '../../types'

export function toAppBarbeiro(row: typeof barbeiros.$inferSelect): Barbeiro {
  return {
    id: row.id,
    nome: row.nome,
    telefone: nullToUndefined(row.telefone),
    avatarUrl: nullToUndefined(row.avatarUrl),
    papel: row.papel,
    ativo: row.ativo,
    convitePendente: !row.clerkUserId,
    diasTrabalho: row.diasTrabalho,
    horaInicio: row.horaInicio,
    horaFim: row.horaFim,
    metaComissaoMensal: nullToUndefined(row.metaComissaoMensal),
  }
}

export async function getBarbeiros(barbeariaId: string): Promise<Barbeiro[]> {
  const rows = await getDb()
    .select()
    .from(barbeiros)
    .where(eq(barbeiros.barbeariaId, barbeariaId))
    .orderBy(barbeiros.nome)
  return rows.map(toAppBarbeiro)
}

/** Sem filtro por barbearia de propósito — é o ponto de entrada que
 * descobre A QUAL barbearia o usuário logado pertence (via barbeariaId do
 * próprio registro retornado), não algo que já sabemos de antemão. */
export async function getBarbeiroByClerkId(clerkUserId: string) {
  const rows = await getDb()
    .select()
    .from(barbeiros)
    .where(eq(barbeiros.clerkUserId, clerkUserId))
    .limit(1)
  return rows[0] ?? null
}

/** Convite pendente: cadastro feito pelo dono, mas ainda sem clerk_user_id
 * ligado — usado pra "reivindicar" a conta no primeiro login por e-mail.
 * Sem filtro por barbearia pelo mesmo motivo do getBarbeiroByClerkId: ainda
 * não sabemos a qual barbearia essa pessoa pertence até achar o convite. */
export async function getConviteBarbeiroPorEmail(email: string) {
  const db = getDb()
  const rows = await db.select().from(barbeiros).where(eq(barbeiros.emailConvite, email)).limit(1)
  const row = rows[0]
  if (!row || row.clerkUserId) return null
  return row
}

export async function vincularClerkIdAoBarbeiro(barbeiroId: string, clerkUserId: string) {
  const rows = await getDb()
    .update(barbeiros)
    .set({ clerkUserId })
    .where(eq(barbeiros.id, barbeiroId))
    .returning()
  return rows[0]
}
