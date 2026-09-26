'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getDb } from '../db'
import { barbearias } from '../db/schema'
import { assertAdmin } from '../lib/adminAuth'
import { getBarbeariaPorId, salvarCobrancaPlataforma, salvarCpfCnpjBarbearia } from '../db/queries/barbearias'
import { mapStatusPagamentoAsaas } from '../lib/asaas'
import {
  buscarAssinaturaPlataforma,
  buscarPixQrCodePlataforma,
  buscarPrimeiroPagamentoDaAssinaturaPlataforma,
  buscarStatusPagamentoPlataforma,
  criarAssinaturaMensalidadeAsaas,
  criarClienteAsaasPlataforma,
  definirCobrancaComoCartaoPlataforma,
} from '../lib/asaasPlataforma'
import { getHojeISO } from '../lib/dateUtils'

function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, '')
}

/** Garante que a barbearia tem cliente + assinatura na conta Asaas da
 * plataforma, criando na primeira vez que o dono tenta pagar. Chamadas
 * seguintes (ex: mês seguinte, se a cobrança anterior venceu) reaproveitam
 * o que já existe.
 *
 * Devolve `{ error }` em vez de lançar exceção — em produção, o Next.js
 * esconde a mensagem de erros lançados numa Server Action (vira "Minified
 * React error #441"), então a única forma confiável do cliente ver a
 * mensagem certa é como dado de retorno normal. */
export async function iniciarPagamentoPlataforma(cpfInput: string): Promise<{ error?: string }> {
  const dono = await assertAdmin()
  const cpf = apenasDigitos(cpfInput)
  if (cpf.length !== 11 && cpf.length !== 14) return { error: 'Digite um CPF ou CNPJ válido.' }

  const barbearia = await getBarbeariaPorId(dono.barbeariaId)
  if (!barbearia) return { error: 'Barbearia não encontrada.' }

  if (barbearia.cpfCnpj !== cpf) {
    await salvarCpfCnpjBarbearia(barbearia.id, cpf)
  }

  let { asaasCustomerId, asaasSubscriptionId } = barbearia
  const assinaturaCriadaAgora = !asaasSubscriptionId

  try {
    if (!asaasCustomerId) {
      const cliente = await criarClienteAsaasPlataforma({
        name: barbearia.nome,
        cpfCnpj: cpf,
        externalReference: barbearia.id,
      })
      asaasCustomerId = cliente.id
    }

    if (!asaasSubscriptionId) {
      const assinatura = await criarAssinaturaMensalidadeAsaas({
        customer: asaasCustomerId,
        nextDueDate: getHojeISO(),
      })
      asaasSubscriptionId = assinatura.id
    }
  } catch (err) {
    console.error('[iniciarPagamentoPlataforma] erro ao criar cobrança no Asaas', err)
    return { error: 'Não foi possível criar a cobrança agora. Tente novamente em instantes.' }
  }

  await salvarCobrancaPlataforma(barbearia.id, {
    asaasCustomerId,
    asaasSubscriptionId,
    // status_pagamento nasce "em_dia" por padrão (valor otimista pra quando
    // ninguém nunca cobrou nada ainda) — assim que a cobrança de verdade é
    // criada, precisa virar "aguardando" até o pagamento confirmar de fato,
    // senão o painel mostra "em dia" sem nunca ter sido pago.
    ...(assinaturaCriadaAgora ? { statusPagamento: 'aguardando' as const } : {}),
  })

  revalidatePath('/admin/plano')
  revalidatePath('/pagamento-pendente')
  return {}
}

/** Lança erro (capturado pelas duas funções abaixo, nunca sai daqui) —
 * mantido como exceção interna só porque simplifica o fluxo entre elas. */
async function pagamentoPendenteDaBarbearia(): Promise<string> {
  const dono = await assertAdmin()
  const barbearia = await getBarbeariaPorId(dono.barbeariaId)
  if (!barbearia?.asaasSubscriptionId) throw new Error('Nenhuma cobrança iniciada ainda.')

  const pagamento = await buscarPrimeiroPagamentoDaAssinaturaPlataforma(barbearia.asaasSubscriptionId)
  if (!pagamento) throw new Error('A cobrança ainda está sendo gerada — tente de novo em instantes.')
  return pagamento.id
}

/** QR code + copia-e-cola do Pix pra pagar a mensalidade da plataforma. */
export async function buscarPixDaMensalidade(): Promise<
  { error: string } | { encodedImage: string; payload: string }
> {
  try {
    const paymentId = await pagamentoPendenteDaBarbearia()
    return await buscarPixQrCodePlataforma(paymentId)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Não foi possível gerar o Pix agora.' }
  }
}

/** Trava a cobrança em cartão e devolve o link seguro hospedado pelo Asaas. */
export async function buscarLinkCartaoDaMensalidade(): Promise<{ error: string } | { invoiceUrl: string }> {
  try {
    const paymentId = await pagamentoPendenteDaBarbearia()
    const atual = await buscarStatusPagamentoPlataforma(paymentId)
    const atualizado = await definirCobrancaComoCartaoPlataforma(paymentId, atual.value, atual.dueDate)
    return { invoiceUrl: atualizado.invoiceUrl }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Não foi possível preparar o pagamento com cartão agora.' }
  }
}

/** Fallback pro webhook: confere direto com o Asaas se a mensalidade já foi
 * paga, e devolve a data da próxima cobrança junto. Chamado toda vez que a
 * tela de plano/bloqueio carrega. */
export async function verificarPagamentoPlataforma() {
  const dono = await assertAdmin()
  const barbearia = await getBarbeariaPorId(dono.barbeariaId)
  if (!barbearia?.asaasSubscriptionId) {
    return { status: barbearia?.statusPagamento ?? 'em_dia', proximaCobranca: null as string | null }
  }

  // Prioriza a data da fatura em aberto (é a cobrança de verdade que o dono
  // precisa pagar). Só cai pro campo da assinatura quando não existe
  // nenhuma fatura pendente ainda — ex: logo depois de pagar, antes da
  // Asaas gerar a fatura do próximo ciclo (o que só acontece alguns dias
  // antes do vencimento).
  const [pagamento, assinatura] = await Promise.all([
    buscarPrimeiroPagamentoDaAssinaturaPlataforma(barbearia.asaasSubscriptionId),
    buscarAssinaturaPlataforma(barbearia.asaasSubscriptionId).catch(() => null),
  ])
  const proximaCobranca = pagamento?.dueDate ?? assinatura?.nextDueDate ?? null

  if (!pagamento) return { status: barbearia.statusPagamento, proximaCobranca }

  const novoStatus = mapStatusPagamentoAsaas(pagamento.status)
  if (!novoStatus || novoStatus === barbearia.statusPagamento) {
    return { status: barbearia.statusPagamento, proximaCobranca }
  }

  await getDb().update(barbearias).set({ statusPagamento: novoStatus }).where(eq(barbearias.id, barbearia.id))
  revalidatePath('/admin/plano')
  revalidatePath('/pagamento-pendente')
  return { status: novoStatus, proximaCobranca }
}
