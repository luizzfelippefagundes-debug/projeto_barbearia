'use server'

import { and, eq, inArray, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getDb } from '../db'
import { assinaturas, clientes, planosAssinatura, planoServicosInclusos } from '../db/schema'
import { assertAdmin } from '../lib/adminAuth'
import { getHojeISO } from '../lib/dateUtils'
import { cancelarAssinaturaComAsaas } from '../lib/asaasCancelamento'
import {
  atualizarValorAssinaturaAsaas,
  atualizarValorCobrancaAsaas,
  buscarAssinatura,
  buscarTodosPagamentosDaAssinatura,
  cancelarAssinaturaAsaas,
  cobrarPagamentoComTokenCartao,
  criarAssinaturaAsaas,
  tokenCartaoMaisRecente,
  vincularCartaoNaAssinatura,
} from '../lib/asaas'

/** Ações desse arquivo devolvem `{ error }` em vez de lançar exceção — em
 * produção, o Next.js esconde a mensagem de erros lançados numa Server
 * Action (vira "Minified React error #441"), então a única forma
 * confiável do cliente ver a mensagem certa é como dado de retorno normal. */
type Resultado = { error?: string }

export async function cancelarAssinatura(assinaturaId: string): Promise<Resultado> {
  const dono = await assertAdmin()

  const [assinatura] = await getDb()
    .select({ id: assinaturas.id })
    .from(assinaturas)
    .where(and(eq(assinaturas.id, assinaturaId), eq(assinaturas.barbeariaId, dono.barbeariaId)))
    .limit(1)
  if (!assinatura) return { error: 'Assinatura não encontrada.' }

  try {
    await cancelarAssinaturaComAsaas(assinaturaId)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Não foi possível cancelar a assinatura.' }
  }

  revalidatePath('/admin/assinaturas')
  revalidatePath('/cliente/perfil')
  return {}
}

export async function reenviarCobranca(assinaturaId: string): Promise<Resultado> {
  const dono = await assertAdmin()
  await getDb()
    .update(assinaturas)
    .set({ ultimoReenvioEm: new Date(), cartaoRecusado: false })
    .where(and(eq(assinaturas.id, assinaturaId), eq(assinaturas.barbeariaId, dono.barbeariaId)))
  revalidatePath('/admin/assinaturas')
  return {}
}

function revalidarTelasDePlano() {
  revalidatePath('/admin/assinaturas')
  revalidatePath('/admin/servicos')
  revalidatePath('/cliente/assinar')
  revalidatePath('/cliente/perfil')
}

export async function criarPlano(
  nome: string,
  valorMensal: number,
  servicosInclusos: Array<{ servicoId: string; limiteMensal: number | null }>,
): Promise<{ error: string } | (typeof planosAssinatura.$inferSelect)> {
  const dono = await assertAdmin()
  if (!nome.trim()) return { error: 'Nome é obrigatório' }

  const db = getDb()
  const rows = await db
    .insert(planosAssinatura)
    .values({ barbeariaId: dono.barbeariaId, nome: nome.trim(), valorMensal })
    .returning()
  const plano = rows[0]

  if (servicosInclusos.length > 0) {
    await db.insert(planoServicosInclusos).values(
      servicosInclusos.map((s) => ({
        planoId: plano.id,
        servicoId: s.servicoId,
        limiteMensal: s.limiteMensal,
      })),
    )
  }

  revalidarTelasDePlano()
  return plano
}

export async function atualizarPlano(
  id: string,
  nome: string,
  valorMensal: number,
  servicosInclusos: Array<{ servicoId: string; limiteMensal: number | null }>,
): Promise<Resultado> {
  const dono = await assertAdmin()
  if (!nome.trim()) return { error: 'Nome é obrigatório' }

  const db = getDb()
  await db
    .update(planosAssinatura)
    .set({ nome: nome.trim(), valorMensal })
    .where(and(eq(planosAssinatura.id, id), eq(planosAssinatura.barbeariaId, dono.barbeariaId)))

  // Refaz a lista de serviços inclusos do zero — mais simples e seguro do
  // que tentar diferenciar o que mudou item a item.
  await db.delete(planoServicosInclusos).where(eq(planoServicosInclusos.planoId, id))
  if (servicosInclusos.length > 0) {
    await db.insert(planoServicosInclusos).values(
      servicosInclusos.map((s) => ({
        planoId: id,
        servicoId: s.servicoId,
        limiteMensal: s.limiteMensal,
      })),
    )
  }

  revalidarTelasDePlano()
  return {}
}

export async function toggleAtivoPlano(id: string, ativo: boolean): Promise<Resultado> {
  const dono = await assertAdmin()
  await getDb()
    .update(planosAssinatura)
    .set({ ativo })
    .where(and(eq(planosAssinatura.id, id), eq(planosAssinatura.barbeariaId, dono.barbeariaId)))
  revalidarTelasDePlano()
  return {}
}

type ItemRecorrencia = { assinaturaId: string; clienteId: string }

export type ResultadoVerificacaoRecorrencia = {
  verificadas: number
  vinculadas: ItemRecorrencia[]
  cobradas: ItemRecorrencia[]
  semIp: ItemRecorrencia[]
  semToken: ItemRecorrencia[]
  erros: number
}

/** Para cada assinatura ativa que já foi paga com cartão alguma vez:
 * vincula o cartão (cobrança automática dos próximos meses) e cobra na hora
 * só as faturas já vencidas — as pendentes o Asaas cobra no vencimento. */
export async function verificarECorrigirRecorrenciaCartao(): Promise<ResultadoVerificacaoRecorrencia> {
  const dono = await assertAdmin()

  const ativas = await getDb()
    .select({
      id: assinaturas.id,
      clienteId: assinaturas.clienteId,
      asaasSubscriptionId: assinaturas.asaasSubscriptionId,
      cartaoRemoteIp: assinaturas.cartaoRemoteIp,
    })
    .from(assinaturas)
    .where(
      and(
        eq(assinaturas.barbeariaId, dono.barbeariaId),
        inArray(assinaturas.status, ['em_dia', 'atrasado']),
      ),
    )

  const comId = ativas.filter((a) => a.asaasSubscriptionId)
  const vinculadas: ItemRecorrencia[] = []
  const cobradas: ItemRecorrencia[] = []
  const semIp: ItemRecorrencia[] = []
  const semToken: ItemRecorrencia[] = []
  let erros = 0

  for (const assinatura of comId) {
    const subscriptionId = assinatura.asaasSubscriptionId!
    const item = { assinaturaId: assinatura.id, clienteId: assinatura.clienteId }
    try {
      const pagamentos = await buscarTodosPagamentosDaAssinatura(subscriptionId)
      const token = tokenCartaoMaisRecente(pagamentos)
      if (!token) {
        const sub = await buscarAssinatura(subscriptionId)
        if (sub.billingType === 'UNDEFINED') semToken.push(item)
        continue
      }

      if (assinatura.cartaoRemoteIp) {
        await vincularCartaoNaAssinatura(subscriptionId, { creditCardToken: token }, assinatura.cartaoRemoteIp)
        vinculadas.push(item)
      } else {
        semIp.push(item)
      }

      const vencida = pagamentos
        .filter((p) => p.status === 'OVERDUE')
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0]
      if (vencida) {
        await cobrarPagamentoComTokenCartao(vencida.id, token)
        cobradas.push(item)
      }
    } catch (err) {
      console.error('[verificarRecorrencia] erro', assinatura.id, err)
      erros++
    }
  }

  revalidatePath('/admin/assinaturas')
  return { verificadas: comId.length, vinculadas, cobradas, semIp, semToken, erros }
}

export type ResultadoSincronizacaoPreco = {
  plano: string
  valorNovo: number
  jaAtualizadas: number
  atualizadas: number
  /** Faturas PENDENTES (ainda não pagas, vencimento futuro) corrigidas
   * pro valor novo. */
  faturasCorrigidas: number
  /** Faturas VENCIDAS ainda no valor antigo — não mexemos (são de antes,
   * podem estar sendo pagas agora); só informamos. */
  vencidasValorAntigo: number
  /** Assinaturas no cartão que o Asaas não deixa mudar de valor (nem a
   * assinatura nem a fatura) — continuam cobrando o valor antigo. */
  travadasNoCartao: number
  erros: number
}

/** Sincroniza o valor cobrado no Asaas de TODAS as assinaturas ativas de um
 * plano com o preço atual do plano no nosso banco. Usado após reajuste.
 *
 * O Asaas gera a fatura do próximo ciclo com antecedência, e mudar só o
 * valor da assinatura NÃO altera essa fatura já gerada — por isso, além de
 * atualizar a assinatura, corrigimos direto toda fatura PENDENTE que ainda
 * esteja no valor antigo. Faturas VENCIDAS são ajustadas quando o cliente
 * clica em renovar. Faturas pagas não são mexidas. */
export async function sincronizarPrecoPlanoNoAsaas(planoId: string): Promise<ResultadoSincronizacaoPreco | Resultado> {
  const dono = await assertAdmin()

  const [plano] = await getDb()
    .select({ nome: planosAssinatura.nome, valorMensal: planosAssinatura.valorMensal })
    .from(planosAssinatura)
    .where(and(eq(planosAssinatura.id, planoId), eq(planosAssinatura.barbeariaId, dono.barbeariaId)))
    .limit(1)
  if (!plano) return { error: 'Plano não encontrado.' }

  const valorNovo = Number(plano.valorMensal)
  if (!Number.isFinite(valorNovo) || valorNovo <= 0) return { error: 'Preço do plano inválido.' }

  const ativas = await getDb()
    .select({
      id: assinaturas.id,
      asaasSubscriptionId: assinaturas.asaasSubscriptionId,
    })
    .from(assinaturas)
    .where(
      and(
        eq(assinaturas.barbeariaId, dono.barbeariaId),
        eq(assinaturas.planoId, planoId),
        inArray(assinaturas.status, ['em_dia', 'atrasado']),
      ),
    )

  const comId = ativas.filter((a) => a.asaasSubscriptionId)
  let jaAtualizadas = 0
  let atualizadas = 0
  let faturasCorrigidas = 0
  let vencidasValorAntigo = 0
  let travadasNoCartao = 0
  let erros = 0
  const mesmoValor = (v: number) => Math.abs(Number(v) - valorNovo) < 0.005

  for (const assinatura of comId) {
    const subscriptionId = assinatura.asaasSubscriptionId!
    try {
      const sub = await buscarAssinatura(subscriptionId)
      let mexeu = false
      let recusou = false
      if (!mesmoValor(sub.value)) {
        try {
          await atualizarValorAssinaturaAsaas(subscriptionId, valorNovo)
          mexeu = true
        } catch (err) {
          // Assinatura de cartão com fatura já paga: o Asaas não deixa mudar
          // o valor da ASSINATURA ("...que já possuam faturas pagas") e
          // também não deixa mudar a FATURA depois que o cliente informou o
          // cartão ("...já informou os dados de Cartão de Crédito") — testado
          // em produção em 19/11/2026. Ainda tenta a fatura (vale pra
          // assinatura sem cartão), mas conta como travada, não como erro.
          console.error('[sincronizarPreco] assinatura recusou mudar valor, tentando a fatura', assinatura.id, err)
          recusou = true
        }
      }

      // Confere as faturas DEPOIS da atualização: a flag
      // updatePendingPayments não tem efeito quando a assinatura já estava
      // no valor novo (reajuste feito antes, sem a flag) — essas faturas
      // pendentes ficaram no valor antigo e precisam ser corrigidas direto.
      const pagamentos = await buscarTodosPagamentosDaAssinatura(subscriptionId)
      for (const p of pagamentos) {
        if (mesmoValor(p.value)) continue
        if (p.status === 'PENDING') {
          try {
            await atualizarValorCobrancaAsaas(p, valorNovo)
            faturasCorrigidas++
            mexeu = true
          } catch (err) {
            console.error('[sincronizarPreco] fatura recusou mudar valor', assinatura.id, p.id, err)
            recusou = true
          }
        } else if (p.status === 'OVERDUE') {
          // Vencida só é ajustada quando o cliente for renovar (aí o
          // vencimento vai pra hoje junto com o valor novo) — mexer em massa
          // aqui jogaria o vencimento de todo mundo pra hoje.
          vencidasValorAntigo++
        }
      }

      // Travada pelo Asaas não é "já estava certa": continua no valor antigo.
      if (recusou) travadasNoCartao++
      else if (mexeu) atualizadas++
      else jaAtualizadas++
    } catch (err) {
      console.error('[sincronizarPreco] erro', assinatura.id, err)
      erros++
    }
  }

  revalidatePath('/admin/assinaturas')
  return { plano: plano.nome, valorNovo, jaAtualizadas, atualizadas, faturasCorrigidas, vencidasValorAntigo, travadasNoCartao, erros }
}

export type DetalheAssinaturaSemToken = {
  assinaturaId: string
  clienteId: string
  nomeCliente: string
  subscriptionId: string
  ultimoPagamento: {
    status: string
    billingType: string
    dueDate: string
    value: number
  } | null
}

export async function detalharAssinaturasSemToken(): Promise<DetalheAssinaturaSemToken[]> {
  const dono = await assertAdmin()

  const ativas = await getDb()
    .select({
      id: assinaturas.id,
      clienteId: assinaturas.clienteId,
      nomeCliente: clientes.nome,
      asaasSubscriptionId: assinaturas.asaasSubscriptionId,
    })
    .from(assinaturas)
    .innerJoin(clientes, eq(clientes.id, assinaturas.clienteId))
    .where(
      and(
        eq(assinaturas.barbeariaId, dono.barbeariaId),
        inArray(assinaturas.status, ['em_dia', 'atrasado']),
      ),
    )

  const resultado: DetalheAssinaturaSemToken[] = []

  for (const assinatura of ativas.filter((a) => a.asaasSubscriptionId)) {
    const subscriptionId = assinatura.asaasSubscriptionId!
    try {
      const sub = await buscarAssinatura(subscriptionId)
      if (sub.billingType !== 'UNDEFINED') continue

      const pagamentos = await buscarTodosPagamentosDaAssinatura(subscriptionId)
      if (tokenCartaoMaisRecente(pagamentos)) continue

      const ultimo = pagamentos.sort((a, b) => b.dueDate.localeCompare(a.dueDate))[0] ?? null

      resultado.push({
        assinaturaId: assinatura.id,
        clienteId: assinatura.clienteId,
        nomeCliente: assinatura.nomeCliente,
        subscriptionId,
        ultimoPagamento: ultimo
          ? { status: ultimo.status, billingType: ultimo.billingType ?? 'UNDEFINED', dueDate: ultimo.dueDate, value: ultimo.value }
          : null,
      })
    } catch {
      // ignora erros individuais
    }
  }

  return resultado
}

export type ItemMigracaoCartao = {
  nomeCliente: string
  proximaCobranca: string | null
  situacao: 'vai_migrar' | 'migrada' | 'vence_hoje' | 'tem_vencida' | 'erro'
  detalhe?: string
}

/** Assinaturas de CARTÃO que ficaram travadas no valor antigo (o Asaas não
 * deixa mudar valor de assinatura nem de fatura depois que o cliente
 * informou o cartão). Pra cada uma: cria uma assinatura nova SEM forma de
 * pagamento, no valor atual do plano, com o mesmo vencimento da próxima
 * cobrança, e apaga a antiga (o que apaga também a fatura pendente dela no
 * valor antigo). O cliente deixa de ser cobrado automaticamente: no
 * vencimento a fatura fica esperando, ele cai em "atrasado", clica em
 * Renovar, paga com cartão o valor novo — e a cobrança automática volta,
 * já no valor novo.
 *
 * `executar: false` só simula (lista quem seria migrado). Quem vence hoje
 * fica de fora: o Asaas pode estar cobrando o cartão nesse momento.
 * A linha local é a MESMA (só troca o asaasSubscriptionId) — criar outra
 * linha faria o webhook cancelar uma das duas como "troca de plano". */
export async function migrarCartaoTravadoParaValorNovo(
  planoId: string,
  executar: boolean,
): Promise<{ itens: ItemMigracaoCartao[] } | Resultado> {
  const dono = await assertAdmin()

  const [plano] = await getDb()
    .select({ nome: planosAssinatura.nome, valorMensal: planosAssinatura.valorMensal })
    .from(planosAssinatura)
    .where(and(eq(planosAssinatura.id, planoId), eq(planosAssinatura.barbeariaId, dono.barbeariaId)))
    .limit(1)
  if (!plano) return { error: 'Plano não encontrado.' }
  const valorNovo = Number(plano.valorMensal)
  if (!Number.isFinite(valorNovo) || valorNovo <= 0) return { error: 'Preço do plano inválido.' }

  const ativas = await getDb()
    .select({
      id: assinaturas.id,
      asaasSubscriptionId: assinaturas.asaasSubscriptionId,
      nomeCliente: clientes.nome,
    })
    .from(assinaturas)
    .innerJoin(clientes, eq(clientes.id, assinaturas.clienteId))
    .where(
      and(
        eq(assinaturas.barbeariaId, dono.barbeariaId),
        eq(assinaturas.planoId, planoId),
        inArray(assinaturas.status, ['em_dia', 'atrasado']),
      ),
    )

  const hoje = getHojeISO()
  const itens: ItemMigracaoCartao[] = []

  for (const a of ativas) {
    if (!a.asaasSubscriptionId) continue
    const antigaId = a.asaasSubscriptionId
    let sub: Awaited<ReturnType<typeof buscarAssinatura>>
    try {
      sub = await buscarAssinatura(antigaId)
    } catch {
      continue // assinatura que o Asaas não acha mais: fora do escopo daqui
    }
    if (sub.billingType !== 'CREDIT_CARD') continue
    if (Math.abs(Number(sub.value) - valorNovo) < 0.005) continue

    let proxima: string
    let temVencida = false
    try {
      const pagamentos = await buscarTodosPagamentosDaAssinatura(antigaId)
      const pendente = pagamentos.filter((p) => p.status === 'PENDING').map((p) => p.dueDate).sort()[0]
      proxima = pendente ?? sub.nextDueDate
      temVencida = pagamentos.some((p) => p.status === 'OVERDUE')
    } catch (err) {
      itens.push({ nomeCliente: a.nomeCliente, proximaCobranca: null, situacao: 'erro', detalhe: 'não deu pra ler as faturas' })
      console.error('[migrarCartao] erro lendo faturas', a.id, err)
      continue
    }

    // Fatura vencida em aberto = dívida real (ex: cartão recusado). Apagar a
    // assinatura antiga apagaria essa dívida junto — fica de fora.
    if (temVencida) {
      itens.push({ nomeCliente: a.nomeCliente, proximaCobranca: proxima, situacao: 'tem_vencida' })
      continue
    }
    if (proxima <= hoje) {
      itens.push({ nomeCliente: a.nomeCliente, proximaCobranca: proxima, situacao: 'vence_hoje' })
      continue
    }
    if (!executar) {
      itens.push({ nomeCliente: a.nomeCliente, proximaCobranca: proxima, situacao: 'vai_migrar' })
      continue
    }

    // 1) cria a nova (sem forma de pagamento, valor novo, mesma data)
    let novaId: string
    try {
      const nova = await criarAssinaturaAsaas({
        customer: sub.customer,
        nextDueDate: proxima,
        value: valorNovo,
        description: sub.description || `Assinatura ${plano.nome}`,
      })
      novaId = nova.id
    } catch (err) {
      console.error('[migrarCartao] erro criando assinatura nova', a.id, err)
      itens.push({ nomeCliente: a.nomeCliente, proximaCobranca: proxima, situacao: 'erro', detalhe: 'Asaas recusou criar a nova' })
      continue
    }

    // 2) aponta a mesma linha local pra nova ANTES de apagar a antiga — assim
    // os avisos do Asaas sobre a antiga (fatura apagada) são ignorados.
    try {
      await getDb()
        .update(assinaturas)
        .set({ asaasSubscriptionId: novaId, asaasFirstPaymentId: null, proximaCobranca: proxima })
        .where(eq(assinaturas.id, a.id))
    } catch (err) {
      console.error('[migrarCartao] erro salvando no banco, desfazendo', a.id, err)
      await cancelarAssinaturaAsaas(novaId).catch(() => {})
      itens.push({ nomeCliente: a.nomeCliente, proximaCobranca: proxima, situacao: 'erro', detalhe: 'erro no banco (desfeito)' })
      continue
    }

    // 3) apaga a antiga (e a fatura pendente dela no valor antigo)
    try {
      await cancelarAssinaturaAsaas(antigaId)
    } catch (err) {
      console.error('[migrarCartao] erro apagando a antiga, desfazendo', a.id, err)
      await getDb().update(assinaturas).set({ asaasSubscriptionId: antigaId }).where(eq(assinaturas.id, a.id)).catch(() => {})
      await cancelarAssinaturaAsaas(novaId).catch(() => {})
      itens.push({ nomeCliente: a.nomeCliente, proximaCobranca: proxima, situacao: 'erro', detalhe: 'Asaas recusou apagar a antiga (desfeito)' })
      continue
    }

    itens.push({ nomeCliente: a.nomeCliente, proximaCobranca: proxima, situacao: 'migrada' })
  }

  if (executar) revalidatePath('/admin/assinaturas')
  return { itens }
}

export async function apagarPlano(id: string): Promise<Resultado> {
  const dono = await assertAdmin()
  const db = getDb()

  const [plano] = await db
    .select({ id: planosAssinatura.id })
    .from(planosAssinatura)
    .where(and(eq(planosAssinatura.id, id), eq(planosAssinatura.barbeariaId, dono.barbeariaId)))
    .limit(1)
  if (!plano) return { error: 'Plano não encontrado.' }

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(assinaturas)
    .where(eq(assinaturas.planoId, id))

  if (total > 0) {
    return {
      error: `Esse plano já teve ${total} assinatura(s) vinculada(s) — não dá pra apagar. Desative em vez disso.`,
    }
  }

  await db.delete(planosAssinatura).where(eq(planosAssinatura.id, id))
  revalidarTelasDePlano()
  return {}
}
