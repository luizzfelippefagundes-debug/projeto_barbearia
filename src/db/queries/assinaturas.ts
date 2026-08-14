import { getDb } from '../index'
import { assinaturas, planosAssinatura } from '../schema'
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
    criadoEm: row.criadoEm.toISOString(),
  }
}

function toAppPlano(row: typeof planosAssinatura.$inferSelect): PlanoAssinatura {
  return {
    id: row.id,
    nome: row.nome,
    valorMensal: row.valorMensal,
    cortesInclusos: row.cortesInclusos ?? 'ilimitado',
  }
}

export async function getAssinaturas(): Promise<Assinatura[]> {
  const rows = await getDb().select().from(assinaturas)
  return rows.map(toAppAssinatura)
}

export async function getPlanosAssinatura(): Promise<PlanoAssinatura[]> {
  const rows = await getDb().select().from(planosAssinatura).orderBy(planosAssinatura.nome)
  return rows.map(toAppPlano)
}
