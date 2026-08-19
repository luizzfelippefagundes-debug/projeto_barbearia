'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { put } from '@vercel/blob'
import { clerkClient } from '@clerk/nextjs/server'
import { getDb } from '../db'
import { barbeiros } from '../db/schema'
import { assertAdmin } from '../lib/adminAuth'
import { getBaseUrl } from '../lib/baseUrl'

export async function atualizarFotoBarbeiro(barbeiroId: string, foto: File) {
  await assertAdmin()
  if (!(foto instanceof File) || foto.size === 0) throw new Error('Selecione uma foto')

  const blob = await put(`barbeiros/${barbeiroId}-${Date.now()}-${foto.name}`, foto, { access: 'public' })
  await getDb().update(barbeiros).set({ avatarUrl: blob.url }).where(eq(barbeiros.id, barbeiroId))

  revalidatePath('/admin/barbeiros')
  revalidatePath('/cliente/agendar')
  revalidatePath('/barbeiro')
}

export async function setComissao(barbeiroId: string, percent: number) {
  await assertAdmin()
  const clamped = Math.min(70, Math.max(20, Math.round(percent)))
  await getDb().update(barbeiros).set({ comissaoPercent: clamped }).where(eq(barbeiros.id, barbeiroId))
  revalidatePath('/admin/barbeiros')
  revalidatePath('/admin/financeiro')
}

export async function criarBarbeiro(
  nome: string,
  comissaoPercent: number,
  emailConvite: string,
  foto?: File,
) {
  await assertAdmin()
  if (!nome.trim()) throw new Error('Nome é obrigatório')
  if (!emailConvite.trim()) throw new Error('E-mail é obrigatório para o convite')

  const email = emailConvite.trim().toLowerCase()
  const clamped = Math.min(70, Math.max(20, Math.round(comissaoPercent)))

  let avatarUrl: string | undefined
  if (foto && foto.size > 0) {
    const blob = await put(`barbeiros/${Date.now()}-${foto.name}`, foto, { access: 'public' })
    avatarUrl = blob.url
  }

  const rows = await getDb()
    .insert(barbeiros)
    .values({ nome: nome.trim(), comissaoPercent: clamped, emailConvite: email, avatarUrl })
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
