import { and, eq, gte, inArray, isNull, lt } from 'drizzle-orm'
import { getDb } from '../index'
import { agendamentos, agendamentoServicos } from '../schema'
import type { Agendamento } from '../../types'

async function servicosPorAgendamento(agendamentoIds: string[]): Promise<Map<string, string[]>> {
  const mapa = new Map<string, string[]>()
  if (agendamentoIds.length === 0) return mapa

  const rows = await getDb()
    .select()
    .from(agendamentoServicos)
    .where(inArray(agendamentoServicos.agendamentoId, agendamentoIds))

  for (const row of rows) {
    const lista = mapa.get(row.agendamentoId) ?? []
    lista.push(row.servicoId)
    mapa.set(row.agendamentoId, lista)
  }
  return mapa
}

function toAppAgendamento(row: typeof agendamentos.$inferSelect, servicoIds: string[]): Agendamento {
  return {
    id: row.id,
    data: row.data,
    hora: row.hora.slice(0, 5),
    clienteId: row.clienteId ?? undefined,
    barbeiroId: row.barbeiroId,
    servicoIds,
    continuacaoDeId: row.continuacaoDeId ?? undefined,
    status: row.status,
    formaPagamento: row.formaPagamento ?? undefined,
    caixaDestinoBarbeiroId: row.caixaDestinoBarbeiroId ?? undefined,
  }
}

async function mapearComServicos(rows: (typeof agendamentos.$inferSelect)[]): Promise<Agendamento[]> {
  const mapaServicos = await servicosPorAgendamento(rows.map((r) => r.id))
  return rows.map((row) => toAppAgendamento(row, mapaServicos.get(row.id) ?? []))
}

export async function getAgendamentosDoMes(mesReferencia: string): Promise<Agendamento[]> {
  const inicio = `${mesReferencia}-01`
  const [ano, mes] = mesReferencia.split('-').map(Number)
  const proximoMes = mes === 12 ? `${ano + 1}-01-01` : `${ano}-${String(mes + 1).padStart(2, '0')}-01`

  const rows = await getDb()
    .select()
    .from(agendamentos)
    .where(and(gte(agendamentos.data, inicio), lt(agendamentos.data, proximoMes)))

  return mapearComServicos(rows)
}

export async function getAgendamentosDoDia(dataISO: string): Promise<Agendamento[]> {
  const rows = await getDb().select().from(agendamentos).where(eq(agendamentos.data, dataISO))
  return mapearComServicos(rows)
}

/** Próximos horários confirmados de um cliente, qualquer dia a partir de
 * hoje (não só hoje) — usado no perfil do cliente pra ele ver e cancelar,
 * igual já existe pelo bot do WhatsApp. */
export async function getProximosAgendamentosDoCliente(clienteId: string, hojeISO: string): Promise<Agendamento[]> {
  const rows = await getDb()
    .select()
    .from(agendamentos)
    .where(
      and(
        eq(agendamentos.clienteId, clienteId),
        isNull(agendamentos.continuacaoDeId),
        eq(agendamentos.status, 'confirmado'),
        gte(agendamentos.data, hojeISO),
      ),
    )
  const lista = await mapearComServicos(rows)
  return lista.sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora))
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
          servicoIds: [],
          status: 'livre',
        })
      }
    }
  }
  return grade
}
