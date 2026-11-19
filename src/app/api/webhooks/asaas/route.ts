import { and, eq, inArray, ne } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getDb } from '../../../../db'
import { asaasWebhookEventos, assinaturas, planosAssinatura } from '../../../../db/schema'
import {
  atualizarValorCobrancaAsaas,
  buscarAssinatura,
  buscarStatusPagamento,
  buscarTodosPagamentosDaAssinatura,
  cancelarAssinaturaAsaas,
  confirmarStatusEmDia,
  mapStatusPagamentoAsaas,
  vincularCartaoNaAssinatura,
} from '../../../../lib/asaas'

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
  const statusEvento = novoStatus ?? (paymentStatus === 'REPROVED' ? 'atrasado' as const : null)
  // Um pagamento confirmado não deixa "em dia" se ainda sobrou outra fatura
  // vencida (ex: devia dois meses e pagou só um).
  const statusFinal = statusEvento ? await confirmarStatusEmDia(subscriptionId, statusEvento) : null

  if (!statusFinal && cartaoRecusado === undefined && !assinaturaAsaas) {
    return NextResponse.json({ ok: true })
  }

  // Busca a assinatura antes de atualizar pra ter o clienteId disponível
  const [assinaturaLocal] = await db
    .select({
      id: assinaturas.id,
      clienteId: assinaturas.clienteId,
      planoId: assinaturas.planoId,
      cartaoRemoteIp: assinaturas.cartaoRemoteIp,
    })
    .from(assinaturas)
    .where(eq(assinaturas.asaasSubscriptionId, subscriptionId))
    .limit(1)

  // Próxima cobrança = a fatura PENDENTE mais próxima. O `nextDueDate` do
  // Asaas é o vencimento do próximo ciclo AINDA NÃO GERADO — como ele gera a
  // fatura do mês seguinte com antecedência, usar só ele mostrava um mês a
  // mais (ex: "17/01" quando a próxima cobrança real é 17/12).
  const pendenteMaisProxima = assinaturaAsaas
    ? await buscarTodosPagamentosDaAssinatura(subscriptionId)
        .then((ps) => ps.filter((p) => p.status === 'PENDING').map((p) => p.dueDate).sort()[0])
        .catch(() => undefined)
    : undefined
  const proximaCobranca = pendenteMaisProxima ?? assinaturaAsaas?.nextDueDate

  await db
    .update(assinaturas)
    .set({
      ...(statusFinal ? { status: statusFinal } : {}),
      ...(cartaoRecusado !== undefined ? { cartaoRecusado } : {}),
      ...(proximaCobranca ? { proximaCobranca } : {}),
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

  // Reforço pro vínculo feito na tela de cartão: só funciona quando a conta
  // tem tokenização ativa (sem ela o Asaas não manda creditCardToken).
  const payment = payload.payment!
  const remoteIp = assinaturaLocal?.cartaoRemoteIp
  if (
    remoteIp &&
    payment.billingType === 'CREDIT_CARD' &&
    (paymentStatus === 'RECEIVED' || paymentStatus === 'CONFIRMED')
  ) {
    const creditCardToken =
      payment.creditCard?.creditCardToken ??
      (await buscarStatusPagamento(payment.id).catch(() => null))?.creditCard?.creditCardToken
    if (creditCardToken) {
      await vincularCartaoNaAssinatura(subscriptionId, { creditCardToken }, remoteIp).catch((err) => {
        console.error('[webhook] erro ao vincular cartão na assinatura', subscriptionId, err)
      })
    }
  }

  // Pagamento confirmado → o Asaas gera a fatura do próximo mês logo em
  // seguida. Em assinatura de cartão com histórico pago, o Asaas NÃO deixa
  // mudar o valor da assinatura, então essa fatura nova nasce no valor
  // antigo. Corrige direto as faturas pendentes pro preço atual do plano.
  if (assinaturaLocal && (paymentStatus === 'RECEIVED' || paymentStatus === 'CONFIRMED')) {
    await alinharFaturasPendentesAoPlano(subscriptionId, assinaturaLocal.planoId).catch((err) => {
      console.error('[webhook] erro ao alinhar faturas pendentes ao preço do plano', subscriptionId, err)
    })
  }

  revalidatePath('/cliente/perfil')
  revalidatePath('/admin/assinaturas')

  return NextResponse.json({ ok: true })
}

async function alinharFaturasPendentesAoPlano(subscriptionId: string, planoId: string) {
  const [plano] = await getDb()
    .select({ valorMensal: planosAssinatura.valorMensal })
    .from(planosAssinatura)
    .where(eq(planosAssinatura.id, planoId))
    .limit(1)
  const preco = Number(plano?.valorMensal)
  if (!Number.isFinite(preco) || preco <= 0) return

  const pagamentos = await buscarTodosPagamentosDaAssinatura(subscriptionId)
  for (const p of pagamentos) {
    if (p.status !== 'PENDING') continue
    if (Math.abs(Number(p.value) - preco) < 0.005) continue
    await atualizarValorCobrancaAsaas(p, preco).catch((err) => {
      console.error('[webhook] não deu pra ajustar a fatura', p.id, 'para', preco, err)
    })
  }
}
