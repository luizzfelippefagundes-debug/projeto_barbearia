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

/** Monta a grade real do dia: barbeiros ativos × horários fixos, usando os
 * agendamentos que existem no banco e sintetizando "livre" (sem gravar nada)
 * para toda combinação sem registro. Nada aqui é fabricado com dados falsos —
 * um slot sem linha no banco é genuinamente livre. */
export async function getGradeAgendaDoDia(
  dataISO: string,
  barbeiroIds: string[],
  timeSlots: string[],
): Promise<Agendamento[]> {
  const existentes = await getAgendamentosDoDia(dataISO)
  const porChave = new Map(existentes.map((a) => [`${a.barbeiroId}|${a.hora}`, a]))

  const grade: Agendamento[] = []
  for (const hora of timeSlots) {
    for (const barbeiroId of barbeiroIds) {
      const chave = `${barbeiroId}|${hora}`
      const existente = porChave.get(chave)
      if (existente) {
        grade.push(existente)
      } else {
        grade.push({
          id: `livre-${barbeiroId}-${hora}`,
          data: dataISO,
          hora,
          barbeiroId,
          status: 'livre',
        })
      }
    }
  }
  return grade
}
