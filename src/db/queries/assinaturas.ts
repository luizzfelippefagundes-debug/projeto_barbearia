import { and, eq, inArray } from 'drizzle-orm'
import { getDb } from '../index'
import { assinaturas, planosAssinatura, planoServicosInclusos, servicos } from '../schema'
import { nullToUndefined } from '../../lib/db-map'
import type { Assinatura, PlanoAssinatura } from '../../types'

function toAppAssinatura(row: typeof assinaturas.$inferSelect): Assinatura {
  return {
    id: row.id,
    clienteId: row.clienteId,
    planoId: row.planoId,
    status: row.status,
    proximaCobranca: row.proximaCobranca,
    cartaoRecusado: row.cartaoRecusado,
    ultimoReenvioEm: nullToUndefined(row.ultimoReenvioEm?.toISOString()),
    asaasSubscriptionId: nullToUndefined(row.asaasSubscriptionId),
    asaasFirstPaymentId: nullToUndefined(row.asaasFirstPaymentId),
    criadoEm: row.criadoEm.toISOString(),
  }
}

export async function getAssinaturas(): Promise<Assinatura[]> {
  const rows = await getDb().select().from(assinaturas)
  return rows.map(toAppAssinatura)
}

export async function getPlanosAssinatura(): Promise<PlanoAssinatura[]> {
  const db = getDb()
  const [planosRows, inclusoesRows] = await Promise.all([
    db.select().from(planosAssinatura).orderBy(planosAssinatura.nome),
    db
      .select({
        planoId: planoServicosInclusos.planoId,
        servicoId: planoServicosInclusos.servicoId,
        limiteMensal: planoServicosInclusos.limiteMensal,
        nome: servicos.nome,
      })
      .from(planoServicosInclusos)
      .innerJoin(servicos, eq(servicos.id, planoServicosInclusos.servicoId)),
  ])

  return planosRows.map((plano) => ({
    id: plano.id,
    nome: plano.nome,
    valorMensal: plano.valorMensal,
    ativo: plano.ativo,
    servicosInclusos: inclusoesRows
      .filter((i) => i.planoId === plano.id)
      .map((i) => ({ servicoId: i.servicoId, nome: i.nome, limiteMensal: i.limiteMensal })),
  }))
}

/** Só os planos ativos — é essa lista que aparece pro cliente escolher ao
 * assinar. Planos desativados continuam existindo pra quem já é assinante. */
export async function getPlanosDisponiveisParaAssinar(): Promise<PlanoAssinatura[]> {
  const planos = await getPlanosAssinatura()
  return planos.filter((p) => p.ativo)
}

export async function getAssinaturaPorId(id: string): Promise<Assinatura | null> {
  const rows = await getDb().select().from(assinaturas).where(eq(assinaturas.id, id)).limit(1)
  return rows[0] ? toAppAssinatura(rows[0]) : null
}

/** "Ativa" aqui significa que o pagamento já aconteceu de verdade em algum
 * momento (em_dia ou atrasado) — uma assinatura que ficou "aguardando" e o
 * cliente nunca terminou de pagar não conta como nada pra ele: pode tentar
 * assinar de novo, sem precisar cancelar primeiro. */
export async function getAssinaturaAtivaDoCliente(clienteId: string): Promise<Assinatura | null> {
  const rows = await getDb()
    .select()
    .from(assinaturas)
    .where(and(eq(assinaturas.clienteId, clienteId), inArray(assinaturas.status, ['em_dia', 'atrasado'])))
    .limit(1)
  return rows[0] ? toAppAssinatura(rows[0]) : null
}
