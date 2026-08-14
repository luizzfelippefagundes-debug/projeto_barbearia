'use server'

import { revalidatePath } from 'next/cache'
import { getDb } from '../db'
import { servicos } from '../db/schema'
import { assertAdmin } from '../lib/adminAuth'

export async function criarServico(nome: string, duracaoMin: number, precoAvulso: number) {
  await assertAdmin()
  if (!nome.trim()) throw new Error('Nome é obrigatório')

  const rows = await getDb()
    .insert(servicos)
    .values({
      nome: nome.trim(),
      duracaoMin: Math.max(5, Math.round(duracaoMin)),
      precoAvulso,
    })
    .returning()

  revalidatePath('/admin/agenda')
  revalidatePath('/admin/barbeiros')
  return rows[0]
}
