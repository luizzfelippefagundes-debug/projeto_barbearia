import { eq } from 'drizzle-orm'
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

export async function getVendas(barbeariaId: string): Promise<Venda[]> {
  const rows = await getDb().select().from(vendas).where(eq(vendas.barbeariaId, barbeariaId))
  return rows.map(toAppVenda)
}
