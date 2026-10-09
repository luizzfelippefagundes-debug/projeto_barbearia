'use server'

import { and, eq, inArray, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getDb } from '../db'
import { assinaturas, clientes, planosAssinatura, planoServicosInclusos } from '../db/schema'
import { assertAdmin } from '../lib/adminAuth'
import { cancelarAssinaturaComAsaas } from '../lib/asaasCancelamento'
import {
  buscarAssinatura,
  buscarTodosPagamentosDaAssinatura,
  cobrarPagamentoComTokenCartao,
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
        await vincularCartaoNaAssinatura(subscriptionId, token, assinatura.cartaoRemoteIp)
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
