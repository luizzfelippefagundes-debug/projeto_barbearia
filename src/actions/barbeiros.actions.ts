'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getDb } from '../db'
import { barbeiros } from '../db/schema'
import { assertAdmin } from '../lib/adminAuth'

export async function setComissao(barbeiroId: string, percent: number) {
  await assertAdmin()
  const clamped = Math.min(70, Math.max(20, Math.round(percent)))
  await getDb().update(barbeiros).set({ comissaoPercent: clamped }).where(eq(barbeiros.id, barbeiroId))
  revalidatePath('/admin/barbeiros')
  revalidatePath('/admin/financeiro')
}

export async function criarBarbeiro(nome: string, comissaoPercent: number, emailConvite: string) {
  await assertAdmin()
  if (!nome.trim()) throw new Error('Nome é obrigatório')
  if (!emailConvite.trim()) throw new Error('E-mail é obrigatório para o convite')
  const clamped = Math.min(70, Math.max(20, Math.round(comissaoPercent)))
  const rows = await getDb()
    .insert(barbeiros)
    .values({ nome: nome.trim(), comissaoPercent: clamped, emailConvite: emailConvite.trim().toLowerCase() })
    .returning()
  revalidatePath('/admin/barbeiros')
  return rows[0]
}
