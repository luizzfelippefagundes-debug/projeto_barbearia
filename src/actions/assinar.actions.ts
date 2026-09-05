'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getDb } from '../db'
import { assinaturas, clientes, planosAssinatura } from '../db/schema'
import { getClienteAtualOuFalhar } from '../lib/clienteAuth'
import { getAssinaturaAtivaDoCliente } from '../db/queries/assinaturas'
import {
  buscarPixQrCode,
  buscarPrimeiroPagamentoDaAssinatura,
  buscarStatusPagamento,
  criarAssinaturaAsaas,
  criarClienteAsaas,
  definirCobrancaComoCartao,
  mapStatusPagamentoAsaas,
} from '../lib/asaas'
import { getHojeISO } from '../lib/dateUtils'

function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, '')
}

export async function assinarPlano(planoId: string, cpfInput: string) {
  const clienteRow = await getClienteAtualOuFalhar()

  const ativa = await getAssinaturaAtivaDoCliente(clienteRow.id)
  if (ativa) throw new Error('Você já tem uma assinatura ativa.')

  const cpf = apenasDigitos(cpfInput)
  if (cpf.length !== 11) throw new Error('Digite um CPF válido (11 dígitos).')

  const db = getDb()

  const planoRows = await db
    .select()
    .from(planosAssinatura)
    .where(eq(planosAssinatura.id, planoId))
    .limit(1)
  const plano = planoRows[0]
  if (!plano) throw new Error('Plano não encontrado.')

  if (clienteRow.cpfCnpj !== cpf) {
    await db.update(clientes).set({ cpfCnpj: cpf }).where(eq(clientes.id, clienteRow.id))
  }

  let asaasCustomerId = clienteRow.asaasCustomerId
  if (!asaasCustomerId) {
    const asaasCustomer = await criarClienteAsaas({
      name: clienteRow.nome,
      cpfCnpj: cpf,
      mobilePhone: clienteRow.telefone ? apenasDigitos(clienteRow.telefone) : undefined,
      externalReference: clienteRow.id,
    })
    asaasCustomerId = asaasCustomer.id
    await db.update(clientes).set({ asaasCustomerId }).where(eq(clientes.id, clienteRow.id))
  }

  const novasRows = await db
    .insert(assinaturas)
    .values({
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
    throw new Error('Não foi possível criar a cobrança agora. Tente novamente em instantes.')
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

  if (assinatura.status !== 'aguardando' || !assinatura.asaasFirstPaymentId) {
    return assinatura.status
  }

  const pagamento = await buscarStatusPagamento(assinatura.asaasFirstPaymentId)
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
  if (!assinatura.asaasFirstPaymentId) {
    throw new Error('A cobrança ainda está sendo gerada — atualize a página em alguns segundos.')
  }
  return assinatura.asaasFirstPaymentId
}

/** QR code + copia-e-cola do Pix pra pagar a primeira cobrança da minha
 * assinatura — nunca sai da nossa tela, nenhum dado sensível envolvido. */
export async function buscarPixDaMinhaAssinatura(assinaturaId: string) {
  const paymentId = await assinaturaComPagamentoDoCliente(assinaturaId)
  return buscarPixQrCode(paymentId)
}

/** Trava a cobrança em cartão de crédito e devolve o link seguro hospedado
 * pelo próprio Asaas — a gente nunca vê o número do cartão. */
export async function buscarLinkCartaoDaMinhaAssinatura(assinaturaId: string) {
  const paymentId = await assinaturaComPagamentoDoCliente(assinaturaId)
  const atual = await buscarStatusPagamento(paymentId)
  const atualizado = await definirCobrancaComoCartao(paymentId, atual.value, atual.dueDate)
  return { invoiceUrl: atualizado.invoiceUrl }
}
