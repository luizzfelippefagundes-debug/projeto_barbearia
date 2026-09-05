import { and, eq, inArray } from 'drizzle-orm'
import { getDb } from '../db'
import { agendamentos, agendamentoServicos, servicos } from '../db/schema'
import { slotsOcupadosPorDuracao, TIME_SLOTS } from './dateUtils'
import type { FormaPagamento } from '../types'

/** Cria um agendamento com um ou mais serviços, reservando quantos slots
 * forem necessários pela soma da duração deles (usa o intervalo real entre
 * os horários fixos, não um passo fixo). O primeiro slot é o "âncora" —
 * guarda os serviços e o cliente de verdade; os slots seguintes (se
 * precisar de mais de um) só existem pra travar o horário, sem serviço
 * próprio, apontando de volta pro âncora via continuacaoDeId.
 *
 * Usado tanto pelo cliente quanto pelo dono ao marcar um horário — lança
 * erro se qualquer um dos slots necessários já estiver ocupado (por outro
 * cliente ou bloqueio do dono). */
export async function criarAgendamentoComServicos(params: {
  data: string
  hora: string
  barbeiroId: string
  clienteId: string
  servicoIds: string[]
  /** 'atendido' pra registrar um atendimento avulso que já aconteceu (o
   * barbeiro loga depois de cortar, sem passar pela etapa de "confirmado"
   * antes). Default 'confirmado', o fluxo normal de agendamento futuro. */
  status?: 'confirmado' | 'atendido'
  /** Só organização/relatório (corte avulso) — não afeta comissão nem
   * fechamento de caixa. Fica só no slot âncora, não nas continuações. */
  formaPagamento?: FormaPagamento
  caixaDestinoBarbeiroId?: string
}): Promise<{ id: string }> {
  const {
    data,
    hora,
    barbeiroId,
    clienteId,
    servicoIds,
    status = 'confirmado',
    formaPagamento,
    caixaDestinoBarbeiroId,
  } = params
  if (servicoIds.length === 0) throw new Error('Escolha pelo menos um serviço.')

  const db = getDb()

  const servicosEscolhidos = await db.select().from(servicos).where(inArray(servicos.id, servicoIds))
  const duracaoTotal = servicosEscolhidos.reduce((sum, s) => sum + s.duracaoMin, 0)
  const slots = slotsOcupadosPorDuracao(hora, duracaoTotal, TIME_SLOTS)

  const existentes = await db
    .select()
    .from(agendamentos)
    .where(
      and(eq(agendamentos.data, data), eq(agendamentos.barbeiroId, barbeiroId), inArray(agendamentos.hora, slots)),
    )
  for (const slot of slots) {
    const existente = existentes.find((e) => e.hora.slice(0, 5) === slot)
    if (existente && existente.status !== 'livre') {
      throw new Error(
        slot === hora
          ? 'Esse horário não está mais disponível — escolha outro.'
          : 'Esses serviços não cabem nesse horário porque o próximo já está ocupado — escolha outro horário ou menos serviços.',
      )
    }
  }

  const [anchor] = await db
    .insert(agendamentos)
    .values({ data, hora: slots[0], barbeiroId, clienteId, status, formaPagamento, caixaDestinoBarbeiroId })
    .onConflictDoUpdate({
      target: [agendamentos.data, agendamentos.hora, agendamentos.barbeiroId],
      set: { status, clienteId, continuacaoDeId: null, formaPagamento, caixaDestinoBarbeiroId },
    })
    .returning()

  await db.insert(agendamentoServicos).values(servicoIds.map((servicoId) => ({ agendamentoId: anchor.id, servicoId })))

  for (const slot of slots.slice(1)) {
    await db
      .insert(agendamentos)
      .values({ data, hora: slot, barbeiroId, clienteId, status, continuacaoDeId: anchor.id })
      .onConflictDoUpdate({
        target: [agendamentos.data, agendamentos.hora, agendamentos.barbeiroId],
        set: { status, clienteId, continuacaoDeId: anchor.id },
      })
  }

  return anchor
}
