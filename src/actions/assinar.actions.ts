'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { getDb } from '../db'
import { assinaturas, clientes, planosAssinatura } from '../db/schema'
import { getClienteAtualOuFalhar } from '../lib/clienteAuth'
import { getAssinaturaAtivaDoCliente } from '../db/queries/assinaturas'
import { cancelarAssinaturaComAsaas } from '../lib/asaasCancelamento'
import {
  buscarPixQrCode,
  buscarPrimeiroPagamentoDaAssinatura,
  buscarQualquerPagamentoDaAssinatura,
  buscarStatusPagamento,
  criarAssinaturaAsaas,
  criarClienteAsaas,
  mapStatusPagamentoAsaas,
  mensagemErroAsaas,
  pagarCobrancaComCartao,
  vincularCartaoNaAssinatura,
  type DadosCartao,
  type TitularCartao,
} from '../lib/asaas'
import { currentUser } from '@clerk/nextjs/server'
import { getHojeISO } from '../lib/dateUtils'

function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, '')
}

/** Devolve `{ error }` em vez de lançar exceção — em produção, o Next.js
 * esconde a mensagem de erros lançados numa Server Action (vira "Minified
 * React error #441"), então a única forma confiável do cliente ver a
 * mensagem certa é como dado de retorno normal. */
export async function assinarPlano(
  planoId: string,
  cpfInput: string,
  opts: { permitirAtiva?: boolean } = {},
): Promise<{ error: string } | { assinaturaId: string }> {
  const clienteRow = await getClienteAtualOuFalhar()

  const ativa = await getAssinaturaAtivaDoCliente(clienteRow.id)
  if (opts.permitirAtiva) {
    if (ativa?.planoId === planoId) return { error: 'Você já assina este plano.' }
  } else {
    if (ativa) return { error: 'Você já tem uma assinatura ativa.' }
  }

  const cpf = apenasDigitos(cpfInput)
  if (cpf.length !== 11) return { error: 'Digite um CPF válido (11 dígitos).' }

  const db = getDb()

  // Se ele já tinha começado a assinar antes e nunca terminou de pagar
  // (ficou "aguardando"), essa tentativa antiga continua rodando sozinha
  // no Asaas até vencer — sem cancelar ela agora, mais tarde ela vira
  // "atrasado" por conta própria e a tela passa a mostrar essa fantasma
  // em vez da assinatura nova que ele realmente pagou.
  const pendentes = await db
    .select({ id: assinaturas.id })
    .from(assinaturas)
    .where(and(eq(assinaturas.clienteId, clienteRow.id), eq(assinaturas.status, 'aguardando')))
  for (const pendente of pendentes) {
    await cancelarAssinaturaComAsaas(pendente.id).catch((err) => {
      console.error('[assinarPlano] falha ao cancelar assinatura pendente antiga', pendente.id, err)
    })
  }

  const planoRows = await db
    .select()
    .from(planosAssinatura)
    .where(and(eq(planosAssinatura.id, planoId), eq(planosAssinatura.barbeariaId, clienteRow.barbeariaId)))
    .limit(1)
  const plano = planoRows[0]
  if (!plano) return { error: 'Plano não encontrado.' }

  if (clienteRow.cpfCnpj !== cpf) {
    await db.update(clientes).set({ cpfCnpj: cpf }).where(eq(clientes.id, clienteRow.id))
  }

  let asaasCustomerId = clienteRow.asaasCustomerId
  if (!asaasCustomerId) {
    let asaasCustomer
    try {
      asaasCustomer = await criarClienteAsaas({
        name: clienteRow.nome,
        cpfCnpj: cpf,
        mobilePhone: clienteRow.telefone ? apenasDigitos(clienteRow.telefone) : undefined,
        externalReference: clienteRow.id,
      })
    } catch (err) {
      return { error: mensagemErroAsaas(err) ?? 'Não foi possível criar seu cadastro de pagamento agora.' }
    }
    asaasCustomerId = asaasCustomer.id
    await db.update(clientes).set({ asaasCustomerId }).where(eq(clientes.id, clienteRow.id))
  }

  const novasRows = await db
    .insert(assinaturas)
    .values({
      barbeariaId: clienteRow.barbeariaId,
      clienteId: clienteRow.id,
      planoId,
      status: 'aguardando',
      proximaCobranca: getHojeISO(),
    })
    .returning()
  const novaAssinatura = novasRows[0]

  try {
    const asaasSub = await criarAssinaturaAsaas({
      customer: asaasCustomerId,
      nextDueDate: getHojeISO(),
      value: plano.valorMensal,
      description: `Assinatura ${plano.nome}`,
    })

    await db
      .update(assinaturas)
      .set({ asaasSubscriptionId: asaasSub.id })
      .where(eq(assinaturas.id, novaAssinatura.id))

    let pagamento = null
    for (let tentativa = 0; tentativa < 3 && !pagamento; tentativa++) {
      pagamento = await buscarPrimeiroPagamentoDaAssinatura(asaasSub.id)
      if (!pagamento) await new Promise((resolve) => setTimeout(resolve, 1200))
    }

    if (pagamento) {
      await db
        .update(assinaturas)
        .set({ asaasFirstPaymentId: pagamento.id })
        .where(eq(assinaturas.id, novaAssinatura.id))
    }
  } catch (err) {
    console.error('[assinarPlano] erro ao criar assinatura no Asaas', err)
    return { error: 'Não foi possível criar a cobrança agora. Tente novamente em instantes.' }
  }

  revalidatePath('/cliente/assinar')
  revalidatePath('/cliente/perfil')
  return { assinaturaId: novaAssinatura.id }
}

/** Fallback pro webhook: confere direto com o Asaas se a cobrança já foi paga.
 * Chamado toda vez que a tela de pagamento carrega, então a assinatura ativa
 * mesmo se o webhook ainda não estiver configurado (ou falhar em chegar). */
export async function verificarPagamentoAssinatura(assinaturaId: string): Promise<string> {
  const clienteRow = await getClienteAtualOuFalhar()

  const rows = await getDb().select().from(assinaturas).where(eq(assinaturas.id, assinaturaId)).limit(1)
  const assinatura = rows[0]
  if (!assinatura || assinatura.clienteId !== clienteRow.id) {
    throw new Error('Assinatura não encontrada.')
  }

  if (assinatura.status !== 'aguardando') {
    return assinatura.status
  }

  // Tenta usar o payment ID salvo; se não tiver (sandbox auto-confirma antes
  // do loop capturar o ID), busca qualquer pagamento da assinatura no Asaas.
  let paymentId = assinatura.asaasFirstPaymentId
  if (!paymentId && assinatura.asaasSubscriptionId) {
    const qualquer = await buscarQualquerPagamentoDaAssinatura(assinatura.asaasSubscriptionId).catch(() => null)
    if (qualquer) {
      paymentId = qualquer.id
      await getDb().update(assinaturas).set({ asaasFirstPaymentId: paymentId }).where(eq(assinaturas.id, assinaturaId))
    }
  }

  if (!paymentId) return assinatura.status

  const pagamento = await buscarStatusPagamento(paymentId)
  const novoStatus = mapStatusPagamentoAsaas(pagamento.status)
  if (!novoStatus) return assinatura.status

  await getDb().update(assinaturas).set({ status: novoStatus }).where(eq(assinaturas.id, assinaturaId))
  revalidatePath('/cliente/perfil')
  revalidatePath('/cliente/assinar')
  revalidatePath('/admin/assinaturas')
  return novoStatus
}

async function assinaturaComPagamentoDoCliente(assinaturaId: string) {
  const clienteRow = await getClienteAtualOuFalhar()

  const rows = await getDb()
    .select()
    .from(assinaturas)
    .where(eq(assinaturas.id, assinaturaId))
    .limit(1)
  const assinatura = rows[0]
  if (!assinatura || assinatura.clienteId !== clienteRow.id) {
    throw new Error('Assinatura não encontrada.')
  }

  // Prioriza o pagamento em aberto atual — em renovações mensais, a função
  // antiga (asaasFirstPaymentId) retornava sempre a primeira fatura já paga
  // e o cliente era mandado pra um link de cobrança que não servia mais.
  if (assinatura.asaasSubscriptionId) {
    const pagamentoAtual = await buscarPrimeiroPagamentoDaAssinatura(assinatura.asaasSubscriptionId)
    if (pagamentoAtual) return { assinatura, paymentId: pagamentoAtual.id }
  }

  if (!assinatura.asaasFirstPaymentId) {
    throw new Error('A cobrança ainda está sendo gerada — atualize a página em alguns segundos.')
  }
  return { assinatura, paymentId: assinatura.asaasFirstPaymentId }
}

/** QR code + copia-e-cola do Pix pra pagar a primeira cobrança da minha
 * assinatura — nunca sai da nossa tela, nenhum dado sensível envolvido. */
export async function buscarPixDaMinhaAssinatura(
  assinaturaId: string,
): Promise<{ error: string } | { encodedImage: string; payload: string }> {
  try {
    const { paymentId } = await assinaturaComPagamentoDoCliente(assinaturaId)
    return await buscarPixQrCode(paymentId)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Não foi possível gerar o Pix agora.' }
  }
}

export interface FormularioCartao {
  nomeNoCartao: string
  numero: string
  validade: string
  cvv: string
  cpfTitular: string
  cep: string
  numeroEndereco: string
  telefone: string
}

function validarFormularioCartao(f: FormularioCartao): { error: string } | {
  creditCard: DadosCartao
  titular: Omit<TitularCartao, 'email'>
} {
  const numero = apenasDigitos(f.numero)
  const [mes, ano] = f.validade.split('/').map((p) => apenasDigitos(p))
  const cvv = apenasDigitos(f.cvv)
  const cpf = apenasDigitos(f.cpfTitular)
  const cep = apenasDigitos(f.cep)
  const telefone = apenasDigitos(f.telefone)

  if (!f.nomeNoCartao.trim()) return { error: 'Informe o nome impresso no cartão.' }
  if (numero.length < 13 || numero.length > 19) return { error: 'Número do cartão inválido.' }
  if (!mes || !ano || Number(mes) < 1 || Number(mes) > 12 || (ano.length !== 2 && ano.length !== 4)) {
    return { error: 'Validade inválida — use MM/AA.' }
  }
  if (cvv.length < 3 || cvv.length > 4) return { error: 'CVV inválido.' }
  if (cpf.length !== 11 && cpf.length !== 14) return { error: 'CPF do titular inválido.' }
  if (cep.length !== 8) return { error: 'CEP inválido.' }
  if (!f.numeroEndereco.trim()) return { error: 'Informe o número do endereço.' }
  if (telefone.length < 10 || telefone.length > 11) return { error: 'Telefone inválido — use DDD + número.' }

  return {
    creditCard: {
      holderName: f.nomeNoCartao.trim(),
      number: numero,
      expiryMonth: mes.padStart(2, '0'),
      expiryYear: ano.length === 2 ? `20${ano}` : ano,
      ccv: cvv,
    },
    titular: {
      name: f.nomeNoCartao.trim(),
      cpfCnpj: cpf,
      postalCode: cep,
      addressNumber: f.numeroEndereco.trim(),
      phone: telefone,
    },
  }
}

/** Cobra a fatura em aberto com o cartão digitado na nossa tela e, se
 * aprovado, vincula o mesmo cartão à assinatura — os meses seguintes passam
 * a ser cobrados sozinhos. Os dados do cartão nunca são gravados. */
export async function pagarMinhaAssinaturaComCartao(
  assinaturaId: string,
  formulario: FormularioCartao,
): Promise<{ error: string } | { ok: true }> {
  const validado = validarFormularioCartao(formulario)
  if ('error' in validado) return validado

  const user = await currentUser()
  const email = user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses[0]?.emailAddress
  if (!email) return { error: 'Sua conta não tem e-mail cadastrado — necessário para pagar com cartão.' }
  const titular: TitularCartao = { ...validado.titular, email }

  let alvo: Awaited<ReturnType<typeof assinaturaComPagamentoDoCliente>>
  try {
    alvo = await assinaturaComPagamentoDoCliente(assinaturaId)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Assinatura não encontrada.' }
  }
  const { assinatura, paymentId } = alvo

  let pagamento
  try {
    pagamento = await pagarCobrancaComCartao(paymentId, validado.creditCard, titular)
  } catch (err) {
    return { error: mensagemErroAsaas(err) ?? 'Pagamento não aprovado. Confira os dados ou tente outro cartão.' }
  }

  const db = getDb()
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0].trim()
  const novoStatus = mapStatusPagamentoAsaas(pagamento.status)
  await db
    .update(assinaturas)
    .set({
      ...(novoStatus ? { status: novoStatus, cartaoRecusado: false } : {}),
      ...(ip ? { cartaoRemoteIp: ip } : {}),
    })
    .where(eq(assinaturas.id, assinaturaId))

  if (assinatura.asaasSubscriptionId && ip) {
    await vincularCartaoNaAssinatura(
      assinatura.asaasSubscriptionId,
      { creditCard: validado.creditCard, creditCardHolderInfo: titular },
      ip,
    ).catch((err) => {
      console.error('[pagarComCartao] pago, mas falhou ao vincular cartão na assinatura', assinatura.asaasSubscriptionId, err)
    })
  } else {
    console.error('[pagarComCartao] pago, mas sem IP do cliente — cartão não vinculado', assinatura.asaasSubscriptionId)
  }

  revalidatePath('/cliente/perfil')
  revalidatePath('/cliente/assinar')
  revalidatePath('/admin/assinaturas')
  return { ok: true }
}

/** Inicia a troca de plano: cria a nova assinatura sem cancelar a atual.
 * A assinatura antiga é cancelada automaticamente pelo webhook quando o
 * pagamento do novo plano for confirmado — assim o cliente não perde o
 * plano atual se abandonar o pagamento no meio do caminho. */
export async function trocarPlano(
  novoPlanoId: string,
  cpfInput: string,
): Promise<{ error: string } | { assinaturaId: string }> {
  return assinarPlano(novoPlanoId, cpfInput, { permitirAtiva: true })
}
