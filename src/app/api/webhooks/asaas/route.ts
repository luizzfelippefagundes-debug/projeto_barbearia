import { and, eq, inArray, ne } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getDb } from '../../../../db'
import { asaasWebhookEventos, assinaturas } from '../../../../db/schema'
import { atualizarAssinaturaParaCartao, buscarAssinatura, cancelarAssinaturaAsaas, mapStatusPagamentoAsaas } from '../../../../lib/asaas'

interface AsaasWebhookPayload {
  id: string
  event: string
  payment?: {
    id: string
    subscription?: string
    status: string
    billingType?: string
    creditCard?: {
      creditCardToken?: string
    }
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

  // Busca a assinatura antes de atualizar pra ter o clienteId disponível
  const [assinaturaLocal] = await db
    .select({ id: assinaturas.id, clienteId: assinaturas.clienteId })
    .from(assinaturas)
    .where(eq(assinaturas.asaasSubscriptionId, subscriptionId))
    .limit(1)

  await db
    .update(assinaturas)
    .set({
      ...(statusFinal ? { status: statusFinal } : {}),
      ...(cartaoRecusado !== undefined ? { cartaoRecusado } : {}),
      ...(assinaturaAsaas ? { proximaCobranca: assinaturaAsaas.nextDueDate } : {}),
    })
    .where(eq(assinaturas.asaasSubscriptionId, subscriptionId))

  // Pagamento confirmado → cancela assinaturas antigas do mesmo cliente
  // (troca de plano: nova só é criada, antiga só cancela aqui quando pago).
  if (statusFinal === 'em_dia' && assinaturaLocal) {
    const antigas = await db
      .select({ id: assinaturas.id, asaasSubscriptionId: assinaturas.asaasSubscriptionId })
      .from(assinaturas)
      .where(
        and(
          eq(assinaturas.clienteId, assinaturaLocal.clienteId),
          ne(assinaturas.id, assinaturaLocal.id),
          inArray(assinaturas.status, ['em_dia', 'atrasado', 'aguardando']),
        ),
      )
    for (const antiga of antigas) {
      if (antiga.asaasSubscriptionId) {
        await cancelarAssinaturaAsaas(antiga.asaasSubscriptionId).catch((err) => {
          console.error('[webhook] erro ao cancelar assinatura antiga na troca', antiga.id, err)
        })
      }
      await db.update(assinaturas).set({ status: 'cancelado' }).where(eq(assinaturas.id, antiga.id))
    }
  }

  // Pagamento com cartão confirmado → atualiza a assinatura no Asaas pra
  // billingType CREDIT_CARD, pra que os ciclos seguintes sejam cobrados
  // automaticamente sem o cliente precisar re-informar o cartão todo mês.
  const paymentBillingType = payload.payment?.billingType
  const creditCardToken = payload.payment?.creditCard?.creditCardToken
  if (paymentBillingType === 'CREDIT_CARD' && (paymentStatus === 'RECEIVED' || paymentStatus === 'CONFIRMED')) {
    if (!creditCardToken) {
      console.error('[webhook] pagamento com cartão sem creditCardToken — cobrança recorrente não será configurada', subscriptionId)
    }
    await atualizarAssinaturaParaCartao(subscriptionId, creditCardToken).catch((err) => {
      console.error('[webhook] erro ao atualizar subscription para CREDIT_CARD', subscriptionId, err)
    })
  }

  revalidatePath('/cliente/perfil')
  revalidatePath('/admin/assinaturas')

  return NextResponse.json({ ok: true })
}
