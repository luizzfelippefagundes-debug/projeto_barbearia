import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getDb } from '../../../../db'
import { asaasWebhookEventos, assinaturas } from '../../../../db/schema'

interface AsaasWebhookPayload {
  id: string
  event: string
  payment?: {
    id: string
    subscription?: string
    status: string
  }
}

const EVENTOS_EM_DIA = new Set(['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED'])
const EVENTOS_ATRASADO = new Set(['PAYMENT_OVERDUE'])

export async function POST(req: Request) {
  const token = req.headers.get('asaas-access-token')
  if (!token || token !== process.env.ASAAS_WEBHOOK_TOKEN) {
    return NextResponse.json({ error: 'não autorizado' }, { status: 401 })
  }

  const payload = (await req.json().catch(() => null)) as AsaasWebhookPayload | null
  if (!payload?.id || !payload.event) {
    return NextResponse.json({ ok: true })
  }

  const db = getDb()

  const inseridas = await db
    .insert(asaasWebhookEventos)
    .values({
      asaasEventId: payload.id,
      evento: payload.event,
      paymentId: payload.payment?.id,
    })
    .onConflictDoNothing()
    .returning()

  if (inseridas.length === 0) {
    return NextResponse.json({ ok: true, duplicado: true })
  }

  const subscriptionId = payload.payment?.subscription
  if (!subscriptionId) {
    return NextResponse.json({ ok: true })
  }

  let novoStatus: 'em_dia' | 'atrasado' | null = null
  if (EVENTOS_EM_DIA.has(payload.event)) novoStatus = 'em_dia'
  else if (EVENTOS_ATRASADO.has(payload.event)) novoStatus = 'atrasado'

  if (!novoStatus) {
    return NextResponse.json({ ok: true })
  }

  await db
    .update(assinaturas)
    .set({ status: novoStatus })
    .where(eq(assinaturas.asaasSubscriptionId, subscriptionId))

  revalidatePath('/cliente/perfil')
  revalidatePath('/admin/assinaturas')

  return NextResponse.json({ ok: true })
}
