import { desc, eq } from 'drizzle-orm'
import { getDb } from '../index'
import { clientes, haircutRecords } from '../schema'
import { nullToUndefined } from '../../lib/db-map'
import type { Cliente, HaircutRecord } from '../../types'

function toAppCliente(row: typeof clientes.$inferSelect, historico: HaircutRecord[] = []): Cliente {
  return {
    id: row.id,
    nome: row.nome,
    telefone: row.telefone,
    avatarUrl: nullToUndefined(row.avatarUrl),
    tags: row.tags,
    historico,
    loyaltyCortesAtual: row.loyaltyCortesAtual,
    loyaltyCortesMeta: row.loyaltyCortesMeta,
    canalIndicacao: row.canalIndicacao,
    indicadoPor: nullToUndefined(row.indicadoPor),
    assinaturaId: nullToUndefined(row.assinaturaId),
    criadoEm: row.criadoEm.toISOString(),
  }
}

function toAppHaircutRecord(row: typeof haircutRecords.$inferSelect): HaircutRecord {
  return {
    id: row.id,
    data: row.data,
    barbeiroId: row.barbeiroId,
    servicoId: row.servicoId,
    fotoUrl: nullToUndefined(row.fotoUrl),
    notas: nullToUndefined(row.notas),
    avaliacao: row.avaliacao,
  }
}

/** Lista de clientes sem histórico (para a lista com busca) — evita carregar
 * todos os haircut_records de todo mundo só pra mostrar nome/telefone. */
export async function getClientesResumo(): Promise<Cliente[]> {
  const rows = await getDb().select().from(clientes).orderBy(clientes.nome)
  return rows.map((r) => toAppCliente(r))
}

export async function getClienteComHistorico(id: string): Promise<Cliente | null> {
  const db = getDb()
  const [clienteRow] = await db.select().from(clientes).where(eq(clientes.id, id)).limit(1)
  if (!clienteRow) return null

  const historicoRows = await db
    .select()
    .from(haircutRecords)
    .where(eq(haircutRecords.clienteId, id))
    .orderBy(desc(haircutRecords.data))

  return toAppCliente(clienteRow, historicoRows.map(toAppHaircutRecord))
}

/** Todos os clientes com histórico completo — usado pelas métricas do
 * Financeiro (clientes sumindo, frequência de retorno). */
export async function getClientesComHistorico(): Promise<Cliente[]> {
  const db = getDb()
  const clienteRows = await db.select().from(clientes).orderBy(clientes.nome)
  const historicoRows = await db.select().from(haircutRecords)

  const porCliente = new Map<string, HaircutRecord[]>()
  for (const row of historicoRows) {
    const lista = porCliente.get(row.clienteId) ?? []
    lista.push(toAppHaircutRecord(row))
    porCliente.set(row.clienteId, lista)
  }

  return clienteRows.map((r) => toAppCliente(r, porCliente.get(r.id) ?? []))
}
