'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { clerkClient } from '@clerk/nextjs/server'
import { getDb } from '../db'
import { barbeiros } from '../db/schema'
import { assertAdmin } from '../lib/adminAuth'
import { getBaseUrl } from '../lib/baseUrl'

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

  const email = emailConvite.trim().toLowerCase()
  const clamped = Math.min(70, Math.max(20, Math.round(comissaoPercent)))

  const rows = await getDb()
    .insert(barbeiros)
    .values({ nome: nome.trim(), comissaoPercent: clamped, emailConvite: email })
    .returning()
  const barbeiro = rows[0]

  revalidatePath('/admin/barbeiros')

  let conviteEnviado = false
  try {
    const baseUrl = await getBaseUrl()
    const client = await clerkClient()
    await client.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: `${baseUrl}/cadastro/barbeiro`,
      notify: true,
    })
    conviteEnviado = true
  } catch {
    // Se já existe convite/conta pra esse e-mail, o cadastro continua
    // válido — o barbeiro só não recebe um novo e-mail automático dessa vez.
    conviteEnviado = false
  }

  return { ...barbeiro, conviteEnviado }
}
