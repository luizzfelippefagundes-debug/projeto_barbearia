'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getDb } from '../db'
import { assinaturas, planosAssinatura, planoServicosInclusos } from '../db/schema'
import { assertAdmin } from '../lib/adminAuth'
import { cancelarAssinaturaComAsaas } from '../lib/asaasCancelamento'

export async function cancelarAssinatura(assinaturaId: string) {
  await assertAdmin()
  await cancelarAssinaturaComAsaas(assinaturaId)
  revalidatePath('/admin/assinaturas')
  revalidatePath('/cliente/perfil')
}

export async function reenviarCobranca(assinaturaId: string) {
  await assertAdmin()
  await getDb()
    .update(assinaturas)
    .set({ ultimoReenvioEm: new Date() })
    .where(eq(assinaturas.id, assinaturaId))
  revalidatePath('/admin/assinaturas')
}

export async function criarPlano(
  nome: string,
  valorMensal: number,
  servicosInclusos: Array<{ servicoId: string; limiteMensal: number | null }>,
) {
  await assertAdmin()
  if (!nome.trim()) throw new Error('Nome é obrigatório')

  const db = getDb()
  const rows = await db.insert(planosAssinatura).values({ nome: nome.trim(), valorMensal }).returning()
  const plano = rows[0]

  if (servicosInclusos.length > 0) {
    await db.insert(planoServicosInclusos).values(
      servicosInclusos.map((s) => ({
        planoId: plano.id,
        servicoId: s.servicoId,
        limiteMensal: s.limiteMensal,
      })),
    )
  }

  revalidatePath('/admin/assinaturas')
  revalidatePath('/cliente/assinar')
  return plano
}
