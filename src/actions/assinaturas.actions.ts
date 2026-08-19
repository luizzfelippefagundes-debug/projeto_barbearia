'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getDb } from '../db'
import { assinaturas, planosAssinatura } from '../db/schema'
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

export async function criarPlano(nome: string, valorMensal: number, cortesInclusos: number | null) {
  await assertAdmin()
  if (!nome.trim()) throw new Error('Nome é obrigatório')

  const rows = await getDb()
    .insert(planosAssinatura)
    .values({ nome: nome.trim(), valorMensal, cortesInclusos })
    .returning()

  revalidatePath('/admin/assinaturas')
  return rows[0]
}
