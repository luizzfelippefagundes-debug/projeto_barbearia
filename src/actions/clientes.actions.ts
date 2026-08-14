'use server'

import { eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { put } from '@vercel/blob'
import { getDb } from '../db'
import { clientes, haircutRecords } from '../db/schema'
import { assertAdmin } from '../lib/adminAuth'
import { getHojeISO } from '../lib/dateUtils'

export async function criarCliente(nome: string, telefone: string) {
  await assertAdmin()
  if (!nome.trim()) throw new Error('Nome é obrigatório')

  const rows = await getDb()
    .insert(clientes)
    .values({ nome: nome.trim(), telefone: telefone.trim() })
    .returning()

  revalidatePath('/admin/clientes')
  revalidatePath('/admin/agenda')
  return rows[0]
}

export async function registrarAtendimento(clienteId: string, formData: FormData) {
  await assertAdmin()

  const barbeiroId = String(formData.get('barbeiroId') ?? '')
  const servicoId = String(formData.get('servicoId') ?? '')
  const nota = String(formData.get('nota') ?? '').trim()
  const foto = formData.get('foto')

  if (!clienteId || !barbeiroId || !servicoId) throw new Error('Dados incompletos')

  let fotoUrl: string | undefined
  if (foto instanceof File && foto.size > 0) {
    const blob = await put(`atendimentos/${clienteId}-${Date.now()}-${foto.name}`, foto, {
      access: 'public',
    })
    fotoUrl = blob.url
  }

  const db = getDb()
  await db.insert(haircutRecords).values({
    clienteId,
    barbeiroId,
    servicoId,
    data: getHojeISO(),
    notas: nota || null,
    fotoUrl: fotoUrl ?? null,
  })

  await db
    .update(clientes)
    .set({
      loyaltyCortesAtual: sql`LEAST(${clientes.loyaltyCortesAtual} + 1, ${clientes.loyaltyCortesMeta})`,
    })
    .where(eq(clientes.id, clienteId))

  revalidatePath('/admin/clientes')
}
