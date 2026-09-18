'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getDb } from '../db'
import { barbearias } from '../db/schema'
import { assertAdmin } from '../lib/adminAuth'
import { getBarbeariaPorId, salvarCobrancaPlataforma, salvarCpfCnpjBarbearia } from '../db/queries/barbearias'
import { mapStatusPagamentoAsaas } from '../lib/asaas'
import {
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
 * o que já existe. */
export async function iniciarPagamentoPlataforma(cpfInput: string) {
  const dono = await assertAdmin()
  const cpf = apenasDigitos(cpfInput)
  if (cpf.length !== 11 && cpf.length !== 14) throw new Error('Digite um CPF ou CNPJ válido.')

  const barbearia = await getBarbeariaPorId(dono.barbeariaId)
  if (!barbearia) throw new Error('Barbearia não encontrada.')

  if (barbearia.cpfCnpj !== cpf) {
    await salvarCpfCnpjBarbearia(barbearia.id, cpf)
  }

  let { asaasCustomerId, asaasSubscriptionId } = barbearia
  const assinaturaCriadaAgora = !asaasSubscriptionId

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
  return { ok: true }
}

async function pagamentoPendenteDaBarbearia() {
  const dono = await assertAdmin()
  const barbearia = await getBarbeariaPorId(dono.barbeariaId)
  if (!barbearia?.asaasSubscriptionId) throw new Error('Nenhuma cobrança iniciada ainda.')

  const pagamento = await buscarPrimeiroPagamentoDaAssinaturaPlataforma(barbearia.asaasSubscriptionId)
  if (!pagamento) throw new Error('A cobrança ainda está sendo gerada — tente de novo em instantes.')
  return pagamento.id
}

/** QR code + copia-e-cola do Pix pra pagar a mensalidade da plataforma. */
export async function buscarPixDaMensalidade() {
  const paymentId = await pagamentoPendenteDaBarbearia()
  return buscarPixQrCodePlataforma(paymentId)
}

/** Trava a cobrança em cartão e devolve o link seguro hospedado pelo Asaas. */
export async function buscarLinkCartaoDaMensalidade() {
  const paymentId = await pagamentoPendenteDaBarbearia()
  const atual = await buscarStatusPagamentoPlataforma(paymentId)
  const atualizado = await definirCobrancaComoCartaoPlataforma(paymentId, atual.value, atual.dueDate)
  return { invoiceUrl: atualizado.invoiceUrl }
}

/** Fallback pro webhook: confere direto com o Asaas se a mensalidade já foi
 * paga, e devolve a data de vencimento da cobrança atual junto. Chamado
 * toda vez que a tela de plano/bloqueio carrega. */
export async function verificarPagamentoPlataforma() {
  const dono = await assertAdmin()
  const barbearia = await getBarbeariaPorId(dono.barbeariaId)
  if (!barbearia?.asaasSubscriptionId) {
    return { status: barbearia?.statusPagamento ?? 'em_dia', proximaCobranca: null as string | null }
  }

  const pagamento = await buscarPrimeiroPagamentoDaAssinaturaPlataforma(barbearia.asaasSubscriptionId)
  if (!pagamento) return { status: barbearia.statusPagamento, proximaCobranca: null }

  const novoStatus = mapStatusPagamentoAsaas(pagamento.status)
  if (!novoStatus || novoStatus === barbearia.statusPagamento) {
    return { status: barbearia.statusPagamento, proximaCobranca: pagamento.dueDate }
  }

  await getDb().update(barbearias).set({ statusPagamento: novoStatus }).where(eq(barbearias.id, barbearia.id))
  revalidatePath('/admin/plano')
  revalidatePath('/pagamento-pendente')
  return { status: novoStatus, proximaCobranca: pagamento.dueDate }
}
