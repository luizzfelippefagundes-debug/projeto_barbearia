import { getDb } from '../index'
import { filaEspera } from '../schema'
import { nullToUndefined } from '../../lib/db-map'
import type { FilaEsperaEntry } from '../../types'

function toAppFilaEntry(row: typeof filaEspera.$inferSelect): FilaEsperaEntry {
  return {
    id: row.id,
    clienteId: row.clienteId,
    desejaBarbeiroId: nullToUndefined(row.desejaBarbeiroId),
    desejaServicoId: nullToUndefined(row.desejaServicoId),
    criadoEm: row.criadoEm.toISOString(),
    notificado: row.notificado,
  }
}

export async function getFilaEspera(): Promise<FilaEsperaEntry[]> {
  const rows = await getDb().select().from(filaEspera).orderBy(filaEspera.criadoEm)
  return rows.map(toAppFilaEntry)
}
