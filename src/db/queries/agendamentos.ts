import { and, eq, gte, lt } from 'drizzle-orm'
import { getDb } from '../index'
import { agendamentos } from '../schema'
import type { Agendamento } from '../../types'

function toAppAgendamento(row: typeof agendamentos.$inferSelect): Agendamento {
  return {
    id: row.id,
    data: row.data,
    hora: row.hora.slice(0, 5),
    clienteId: row.clienteId ?? undefined,
    barbeiroId: row.barbeiroId,
    servicoId: row.servicoId ?? undefined,
    status: row.status,
  }
}

export async function getAgendamentosDoMes(mesReferencia: string): Promise<Agendamento[]> {
  const inicio = `${mesReferencia}-01`
  const [ano, mes] = mesReferencia.split('-').map(Number)
  const proximoMes = mes === 12 ? `${ano + 1}-01-01` : `${ano}-${String(mes + 1).padStart(2, '0')}-01`

  const rows = await getDb()
    .select()
    .from(agendamentos)
    .where(and(gte(agendamentos.data, inicio), lt(agendamentos.data, proximoMes)))

  return rows.map(toAppAgendamento)
}

export async function getAgendamentosDoDia(dataISO: string): Promise<Agendamento[]> {
  const rows = await getDb().select().from(agendamentos).where(eq(agendamentos.data, dataISO))
  return rows.map(toAppAgendamento)
}
