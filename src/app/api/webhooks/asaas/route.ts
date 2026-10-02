import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getDb } from '../../../../db'
import { asaasWebhookEventos, assinaturas } from '../../../../db/schema'
import { atualizarAssinaturaParaCartao, buscarAssinatura, mapStatusPagamentoAsaas } from '../../../../lib/asaas'

interface AsaasWebhookPayload {
  id: string
  event: string
  payment?: {
    id: string
    subscription?: string
    status: string
    billingType?: string
  }
}

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

  const paymentStatus = payload.payment?.status
  const novoStatus = paymentStatus ? mapStatusPagamentoAsaas(paymentStatus) : null
  const cartaoRecusado = paymentStatus === 'REPROVED' ? true : paymentStatus && ['RECEIVED', 'CONFIRMED'].includes(paymentStatus) ? false : undefined

  // Sempre tenta atualizar a próxima cobrança (vem do ciclo seguinte da
  // assinatura, não da fatura desse evento) — sem isso, a data fica travada
  // no primeiro pagamento pra sempre, mesmo com o status virando em_dia/
  // atrasado certinho a cada mês.
  const assinaturaAsaas = await buscarAssinatura(subscriptionId).catch(() => null)

  // REPROVED = cartão recusado: força atrasado mesmo sem status mapeado
  const statusFinal = novoStatus ?? (paymentStatus === 'REPROVED' ? 'atrasado' as const : null)

  if (!statusFinal && cartaoRecusado === undefined && !assinaturaAsaas) {
    return NextResponse.json({ ok: true })
  }

  await db
    .update(assinaturas)
    .set({
      ...(statusFinal ? { status: statusFinal } : {}),
      ...(cartaoRecusado !== undefined ? { cartaoRecusado } : {}),
      ...(assinaturaAsaas ? { proximaCobranca: assinaturaAsaas.nextDueDate } : {}),
    })
    .where(eq(assinaturas.asaasSubscriptionId, subscriptionId))

  // Pagamento com cartão confirmado → atualiza a assinatura no Asaas pra
  // billingType CREDIT_CARD, pra que os ciclos seguintes sejam cobrados
  // automaticamente sem o cliente precisar re-informar o cartão todo mês.
  const paymentBillingType = payload.payment?.billingType
  if (paymentBillingType === 'CREDIT_CARD' && (paymentStatus === 'RECEIVED' || paymentStatus === 'CONFIRMED')) {
    await atualizarAssinaturaParaCartao(subscriptionId).catch((err) => {
      console.error('[webhook] erro ao atualizar subscription para CREDIT_CARD', subscriptionId, err)
    })
  }

  revalidatePath('/cliente/perfil')
  revalidatePath('/admin/assinaturas')

  return NextResponse.json({ ok: true })
}
