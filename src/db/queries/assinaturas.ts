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

export async function getAssinaturas(barbeariaId: string): Promise<Assinatura[]> {
  const rows = await getDb().select().from(assinaturas).where(eq(assinaturas.barbeariaId, barbeariaId))
  return rows.map(toAppAssinatura)
}

export async function getPlanosAssinatura(barbeariaId: string): Promise<PlanoAssinatura[]> {
  const db = getDb()
  const [planosRows, inclusoesRows] = await Promise.all([
    db
      .select()
      .from(planosAssinatura)
      .where(eq(planosAssinatura.barbeariaId, barbeariaId))
      .orderBy(planosAssinatura.nome),
    db
      .select({
        planoId: planoServicosInclusos.planoId,
        servicoId: planoServicosInclusos.servicoId,
        limiteMensal: planoServicosInclusos.limiteMensal,
        nome: servicos.nome,
      })
      .from(planoServicosInclusos)
      .innerJoin(servicos, eq(servicos.id, planoServicosInclusos.servicoId))
      .where(eq(servicos.barbeariaId, barbeariaId)),
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
export async function getPlanosDisponiveisParaAssinar(barbeariaId: string): Promise<PlanoAssinatura[]> {
  const planos = await getPlanosAssinatura(barbeariaId)
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
/** Escolhe qual assinatura mostrar pro cliente, entre as que já foram
 * pagas em algum momento (em_dia ou atrasado) — prioriza "em_dia" mesmo
 * que não seja a mais antiga. Existe porque uma tentativa de assinatura
 * anterior, nunca cancelada de verdade, pode ficar rodando sozinha no
 * Asaas e vencer (virando "atrasado") depois que uma tentativa mais nova
 * já foi paga — sem essa prioridade, a tela mostrava a antiga vencida em
 * vez da nova em dia. */
export function escolherAssinaturaPrincipal(assinaturasDoCliente: Assinatura[]): Assinatura | undefined {
  const emDia = assinaturasDoCliente.find((a) => a.status === 'em_dia')
  if (emDia) return emDia
  return assinaturasDoCliente.find((a) => a.status === 'atrasado')
}

export async function getAssinaturaAtivaDoCliente(clienteId: string): Promise<Assinatura | null> {
  const rows = await getDb()
    .select()
    .from(assinaturas)
    .where(and(eq(assinaturas.clienteId, clienteId), inArray(assinaturas.status, ['em_dia', 'atrasado'])))
    .limit(1)
  return rows[0] ? toAppAssinatura(rows[0]) : null
}
