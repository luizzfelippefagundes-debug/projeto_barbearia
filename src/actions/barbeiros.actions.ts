'use server'

import { and, eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { put } from '@vercel/blob'
import { clerkClient } from '@clerk/nextjs/server'
import { isClerkAPIResponseError } from '@clerk/nextjs/errors'
import { getDb } from '../db'
import { barbeiros, payoutsBarbeiros, haircutRecords, vendas } from '../db/schema'
import { assertAdmin } from '../lib/adminAuth'
import { getBaseUrl } from '../lib/baseUrl'
import { getHojeISO } from '../lib/dateUtils'

export async function atualizarFotoBarbeiro(barbeiroId: string, foto: File) {
  await assertAdmin()
  if (!(foto instanceof File) || foto.size === 0) throw new Error('Selecione uma foto')

  const blob = await put(`barbeiros/${barbeiroId}-${Date.now()}-${foto.name}`, foto, { access: 'public' })
  await getDb().update(barbeiros).set({ avatarUrl: blob.url }).where(eq(barbeiros.id, barbeiroId))

  revalidatePath('/admin/barbeiros')
  revalidatePath('/cliente/agendar')
  revalidatePath('/barbeiro')
}

/** O repasse pro barbeiro é manual (o dono paga por fora — Pix, dinheiro
 * etc.) — isso só registra que já foi pago, pra não ficar mostrando "sem
 * repasse" pra sempre mesmo depois do dono ter pagado de verdade. */
export async function marcarRepasseComoPago(barbeiroId: string, mesReferencia: string, valor: number) {
  await assertAdmin()

  const db = getDb()
  const existente = await db
    .select()
    .from(payoutsBarbeiros)
    .where(and(eq(payoutsBarbeiros.barbeiroId, barbeiroId), eq(payoutsBarbeiros.mesReferencia, mesReferencia)))
    .limit(1)

  if (existente[0]) {
    await db
      .update(payoutsBarbeiros)
      .set({ status: 'transferido', dataTransferencia: getHojeISO(), valor })
      .where(eq(payoutsBarbeiros.id, existente[0].id))
  } else {
    await db.insert(payoutsBarbeiros).values({
      barbeiroId,
      mesReferencia,
      valor,
      status: 'transferido',
      dataTransferencia: getHojeISO(),
    })
  }

  revalidatePath('/admin/barbeiros')
  revalidatePath('/barbeiro/comissao')
}

/** Barbeiro que já teve algum atendimento/venda registrado não pode ser
 * apagado direto — apagaria o histórico junto (a FK é cascade). Nesse caso
 * o dono precisa só desativar (campo `ativo`), não excluir de verdade.
 * Apagar uma conta de dono só é permitido se sobrar pelo menos outra —
 * senão ninguém mais conseguiria entrar no painel administrativo. */
export async function apagarBarbeiro(barbeiroId: string) {
  await assertAdmin()

  const db = getDb()
  const [alvo] = await db.select().from(barbeiros).where(eq(barbeiros.id, barbeiroId)).limit(1)
  if (!alvo) throw new Error('Barbeiro não encontrado')

  if (alvo.papel === 'dono') {
    const [{ count: totalDonos }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(barbeiros)
      .where(eq(barbeiros.papel, 'dono'))
    if (Number(totalDonos) <= 1) {
      throw new Error('Não dá pra apagar o último dono — ninguém mais conseguiria entrar no painel.')
    }
  }

  const [{ count: totalAtendimentos }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(haircutRecords)
    .where(eq(haircutRecords.barbeiroId, barbeiroId))
  const [{ count: totalVendas }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(vendas)
    .where(eq(vendas.barbeiroId, barbeiroId))

  if (Number(totalAtendimentos) > 0 || Number(totalVendas) > 0) {
    throw new Error('Esse barbeiro já tem histórico de atendimentos ou vendas — desative em vez de apagar.')
  }

  await db.delete(barbeiros).where(eq(barbeiros.id, barbeiroId))
  revalidatePath('/admin/barbeiros')
}

export async function editarBarbeiro(barbeiroId: string, nome: string, telefone: string) {
  await assertAdmin()
  if (!nome.trim()) throw new Error('Nome é obrigatório')

  await getDb()
    .update(barbeiros)
    .set({ nome: nome.trim(), telefone: telefone.trim() || null })
    .where(eq(barbeiros.id, barbeiroId))
  revalidatePath('/admin/barbeiros')
  revalidatePath('/cliente/agendar')
  revalidatePath('/barbeiro')
}

/** Só filtra o que aparece pro CLIENTE agendar (site + bot do WhatsApp) —
 * a agenda do dono/barbeiro em si continua livre pra marcar/bloquear
 * qualquer horário manualmente, exceções pontuais seguem via "bloquear
 * horário" de sempre. */
export async function editarHorarioTrabalho(
  barbeiroId: string,
  diasTrabalho: number[],
  horaInicio: string,
  horaFim: string,
) {
  await assertAdmin()
  if (diasTrabalho.length === 0) throw new Error('Escolha pelo menos um dia da semana.')
  if (horaInicio >= horaFim) throw new Error('O horário de início precisa ser antes do de fim.')

  await getDb().update(barbeiros).set({ diasTrabalho, horaInicio, horaFim }).where(eq(barbeiros.id, barbeiroId))
  revalidatePath('/admin/barbeiros')
  revalidatePath('/barbeiro/perfil')
  revalidatePath('/cliente/agendar')
}

export async function toggleAtivoBarbeiro(barbeiroId: string, ativo: boolean) {
  await assertAdmin()
  await getDb().update(barbeiros).set({ ativo }).where(eq(barbeiros.id, barbeiroId))
  revalidatePath('/admin/barbeiros')
  revalidatePath('/admin/agenda')
  revalidatePath('/cliente/agendar')
}

export async function criarBarbeiro(nome: string, emailConvite: string, foto?: File) {
  await assertAdmin()
  if (!nome.trim()) throw new Error('Nome é obrigatório')
  if (!emailConvite.trim()) throw new Error('E-mail é obrigatório para o convite')

  const email = emailConvite.trim().toLowerCase()

  let avatarUrl: string | undefined
  if (foto && foto.size > 0) {
    const blob = await put(`barbeiros/${Date.now()}-${foto.name}`, foto, { access: 'public' })
    avatarUrl = blob.url
  }

  const rows = await getDb()
    .insert(barbeiros)
    .values({ nome: nome.trim(), emailConvite: email, avatarUrl })
    .returning()
  const barbeiro = rows[0]

  revalidatePath('/admin/barbeiros')

  let conviteEnviado = false
  let emailJaExiste = false
  try {
    const baseUrl = await getBaseUrl()
    const client = await clerkClient()
    await client.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: `${baseUrl}/cadastro/barbeiro`,
      notify: true,
    })
    conviteEnviado = true
  } catch (err) {
    // Se já existe convite/conta pra esse e-mail, o cadastro continua
    // válido — o barbeiro só não recebe um novo e-mail automático dessa vez,
    // porque ele já consegue entrar direto (requireBarbeiroAccess vincula
    // pelo e-mail no primeiro login).
    conviteEnviado = false
    if (isClerkAPIResponseError(err)) {
      emailJaExiste = err.errors.some((e) => e.code === 'form_identifier_exists')
    }
  }

  return { ...barbeiro, conviteEnviado, emailJaExiste }
}
