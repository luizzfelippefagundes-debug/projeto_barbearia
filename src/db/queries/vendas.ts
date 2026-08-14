import { getDb } from '../index'
import { vendas } from '../schema'
import { nullToUndefined } from '../../lib/db-map'
import type { Venda } from '../../types'

function toAppVenda(row: typeof vendas.$inferSelect): Venda {
  return {
    id: row.id,
    produtoId: row.produtoId,
    barbeiroId: row.barbeiroId,
    clienteId: nullToUndefined(row.clienteId),
    quantidade: row.quantidade,
    data: row.data,
    valorTotal: row.valorTotal,
  }
}

export async function getVendas(): Promise<Venda[]> {
  const rows = await getDb().select().from(vendas)
  return rows.map(toAppVenda)
}
