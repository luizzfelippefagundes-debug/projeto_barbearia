import { desc, eq } from 'drizzle-orm'
import { getDb } from '../index'
import { payoutsBarbeiros } from '../schema'
import { nullToUndefined } from '../../lib/db-map'
import type { PayoutBarbeiro } from '../../types'

function toAppPayout(row: typeof payoutsBarbeiros.$inferSelect): PayoutBarbeiro {
  return {
    id: row.id,
    barbeiroId: row.barbeiroId,
    mesReferencia: row.mesReferencia,
    valor: row.valor,
    status: row.status,
    dataTransferencia: nullToUndefined(row.dataTransferencia),
  }
}

export async function getPayoutsDoMes(mesReferencia: string): Promise<PayoutBarbeiro[]> {
  const rows = await getDb()
    .select()
    .from(payoutsBarbeiros)
    .where(eq(payoutsBarbeiros.mesReferencia, mesReferencia))
  return rows.map(toAppPayout)
}

/** Últimos meses de repasse de um barbeiro específico — mais recente
 * primeiro, pra ele acompanhar a evolução, não só o mês atual. */
export async function getPayoutsDoBarbeiro(barbeiroId: string, limite: number): Promise<PayoutBarbeiro[]> {
  const rows = await getDb()
    .select()
    .from(payoutsBarbeiros)
    .where(eq(payoutsBarbeiros.barbeiroId, barbeiroId))
    .orderBy(desc(payoutsBarbeiros.mesReferencia))
    .limit(limite)
  return rows.map(toAppPayout)
}
