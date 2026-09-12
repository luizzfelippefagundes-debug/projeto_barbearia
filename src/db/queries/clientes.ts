import { and, desc, eq } from 'drizzle-orm'
import { getDb } from '../index'
import { clientes, haircutRecords } from '../schema'
import { nullToUndefined } from '../../lib/db-map'
import type { Cliente, HaircutRecord } from '../../types'

function toAppCliente(row: typeof clientes.$inferSelect, historico: HaircutRecord[] = []): Cliente {
  return {
    id: row.id,
    barbeariaId: row.barbeariaId,
    nome: row.nome,
    telefone: row.telefone,
    cpfCnpj: nullToUndefined(row.cpfCnpj),
    asaasCustomerId: nullToUndefined(row.asaasCustomerId),
    avatarUrl: nullToUndefined(row.avatarUrl),
    tags: row.tags,
    historico,
    loyaltyCortesAtual: row.loyaltyCortesAtual,
    loyaltyCortesMeta: row.loyaltyCortesMeta,
    canalIndicacao: row.canalIndicacao,
    indicadoPor: nullToUndefined(row.indicadoPor),
    codigoIndicacao: nullToUndefined(row.codigoIndicacao),
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
export async function getClientesResumo(barbeariaId: string): Promise<Cliente[]> {
  const rows = await getDb()
    .select()
    .from(clientes)
    .where(eq(clientes.barbeariaId, barbeariaId))
    .orderBy(clientes.nome)
  return rows.map((r) => toAppCliente(r))
}

export async function getClienteIdPorCodigoIndicacao(codigo: string): Promise<string | null> {
  const rows = await getDb()
    .select({ id: clientes.id })
    .from(clientes)
    .where(eq(clientes.codigoIndicacao, codigo.toUpperCase()))
    .limit(1)
  return rows[0]?.id ?? null
}

/** `barbeariaId` é obrigatório aqui porque o `id` costuma vir de um
 * parâmetro de URL (`?cliente=...`) — sem essa checagem, o dono de uma
 * barbearia poderia ver o histórico de um cliente de outra só editando a URL. */
export async function getClienteComHistorico(id: string, barbeariaId: string): Promise<Cliente | null> {
  const db = getDb()
  const [clienteRow] = await db
    .select()
    .from(clientes)
    .where(and(eq(clientes.id, id), eq(clientes.barbeariaId, barbeariaId)))
    .limit(1)
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
export async function getClientesComHistorico(barbeariaId: string): Promise<Cliente[]> {
  const db = getDb()
  const clienteRows = await db.select().from(clientes).where(eq(clientes.barbeariaId, barbeariaId)).orderBy(clientes.nome)
  const historicoRows = await db.select().from(haircutRecords).where(eq(haircutRecords.barbeariaId, barbeariaId))

  const porCliente = new Map<string, HaircutRecord[]>()
  for (const row of historicoRows) {
    const lista = porCliente.get(row.clienteId) ?? []
    lista.push(toAppHaircutRecord(row))
    porCliente.set(row.clienteId, lista)
  }

  return clienteRows.map((r) => toAppCliente(r, porCliente.get(r.id) ?? []))
}
