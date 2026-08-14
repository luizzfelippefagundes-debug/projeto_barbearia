import { eq } from 'drizzle-orm'
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
