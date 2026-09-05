'use server'

import { and, eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getDb } from '../db'
import { agendamentos, agendamentoServicos, clientes, haircutRecords } from '../db/schema'
import { assertAdmin } from '../lib/adminAuth'
import { criarAgendamentoComServicos } from '../lib/agendaBooking'
import { getHojeISO, TIME_SLOTS } from '../lib/dateUtils'
import type { FormaPagamento } from '../types'

function revalidarAgenda() {
  revalidatePath('/admin/agenda')
  revalidatePath('/barbeiro/agenda')
  revalidatePath('/cliente/agendar')
}

export async function criarOuAtualizarHorario(
  data: string,
  hora: string,
  barbeiroId: string,
  clienteId: string,
  servicoIds: string[],
) {
  await assertAdmin()
  if (!clienteId) throw new Error('Escolha um cliente.')

  await criarAgendamentoComServicos({ data, hora, barbeiroId, clienteId, servicoIds })

  revalidarAgenda()
}

/** Bloqueia um horário específico de um barbeiro (ex: almoço, compromisso) —
 * o cliente não consegue agendar nesse slot. Não bloqueia se já tiver um
 * cliente marcado ali (precisa cancelar o agendamento antes). */
export async function bloquearHorario(data: string, hora: string, barbeiroId: string) {
  await assertAdmin()

  const db = getDb()
  const existente = await db
    .select()
    .from(agendamentos)
    .where(and(eq(agendamentos.data, data), eq(agendamentos.hora, hora), eq(agendamentos.barbeiroId, barbeiroId)))
    .limit(1)
  if (existente[0]?.status === 'confirmado' || existente[0]?.status === 'atendido') {
    throw new Error('Esse horário já tem um cliente marcado — cancele o agendamento antes de bloquear.')
  }

  await db
    .insert(agendamentos)
    .values({ data, hora, barbeiroId, status: 'bloqueado', clienteId: null })
    .onConflictDoUpdate({
      target: [agendamentos.data, agendamentos.hora, agendamentos.barbeiroId],
      set: { status: 'bloqueado', clienteId: null },
    })

  revalidarAgenda()
}

export async function desbloquearHorario(data: string, hora: string, barbeiroId: string) {
  await assertAdmin()

  await getDb()
    .delete(agendamentos)
    .where(
      and(
        eq(agendamentos.data, data),
        eq(agendamentos.hora, hora),
        eq(agendamentos.barbeiroId, barbeiroId),
        eq(agendamentos.status, 'bloqueado'),
      ),
    )

  revalidarAgenda()
}

/** Bloqueia o dia inteiro pra um barbeiro (ex: folga, feriado) — pula
 * qualquer horário que já tenha cliente marcado. */
export async function bloquearDiaInteiro(data: string, barbeiroId: string) {
  await assertAdmin()

  const db = getDb()
  const existentes = await db
    .select()
    .from(agendamentos)
    .where(and(eq(agendamentos.data, data), eq(agendamentos.barbeiroId, barbeiroId)))
  const ocupados = new Set(
    existentes.filter((a) => a.status === 'confirmado' || a.status === 'atendido').map((a) => a.hora),
  )

  for (const hora of TIME_SLOTS) {
    if (ocupados.has(hora)) continue
    await db
      .insert(agendamentos)
      .values({ data, hora, barbeiroId, status: 'bloqueado', clienteId: null })
      .onConflictDoUpdate({
        target: [agendamentos.data, agendamentos.hora, agendamentos.barbeiroId],
        set: { status: 'bloqueado', clienteId: null },
      })
  }

  revalidarAgenda()
}

export async function desbloquearDiaInteiro(data: string, barbeiroId: string) {
  await assertAdmin()

  await getDb()
    .delete(agendamentos)
    .where(
      and(
        eq(agendamentos.data, data),
        eq(agendamentos.barbeiroId, barbeiroId),
        eq(agendamentos.status, 'bloqueado'),
      ),
    )

  revalidarAgenda()
}

/** Marca que o cliente confirmado não apareceu — diferente de bloquear ou
 * cancelar, fica registrado no histórico (pra acompanhar quem falta muito)
 * mas não conta como atendimento nem comissão. Se o agendamento ocupou
 * mais de um slot (serviços com duração somada), marca a continuação
 * junto, pra não sobrar um horário "livre" no meio de um "não compareceu". */
export async function marcarNaoCompareceu(agendamentoId: string) {
  await assertAdmin()

  const db = getDb()
  const rows = await db
    .update(agendamentos)
    .set({ status: 'nao_compareceu' })
    .where(and(eq(agendamentos.id, agendamentoId), eq(agendamentos.status, 'confirmado')))
    .returning()
  if (rows.length === 0) throw new Error('Esse agendamento não está mais confirmado.')

  await db
    .update(agendamentos)
    .set({ status: 'nao_compareceu' })
    .where(and(eq(agendamentos.continuacaoDeId, agendamentoId), eq(agendamentos.status, 'confirmado')))

  revalidarAgenda()
}

/** Cancela um agendamento de verdade (diferente de "não compareceu") —
 * apaga a linha e libera o horário pra outra pessoa marcar. Serviços
 * ligados e eventuais continuações (por duração) somem junto, em cascata. */
export async function cancelarAgendamentoAdmin(agendamentoId: string) {
  await assertAdmin()

  const rows = await getDb().delete(agendamentos).where(eq(agendamentos.id, agendamentoId)).returning()
  if (rows.length === 0) throw new Error('Esse agendamento não foi encontrado.')

  revalidarAgenda()
}

/** Troca quais serviços estão ligados a um agendamento já marcado — pra
 * corrigir um lançamento errado (ex: marcou "Navalhado" mas era outro
 * serviço). Só funciona com "confirmado" ainda não atendido: uma vez que o
 * barbeiro registra o atendimento, já gerou histórico de corte (haircut
 * records) e comissão em cima do serviço antigo, e essa troca não teria
 * como corrigir isso retroativamente. */
export async function editarServicosAgendamento(agendamentoId: string, servicoIds: string[]) {
  await assertAdmin()
  if (servicoIds.length === 0) throw new Error('Escolha pelo menos um serviço.')

  const db = getDb()
  const [agendamento] = await db.select().from(agendamentos).where(eq(agendamentos.id, agendamentoId)).limit(1)
  if (!agendamento) throw new Error('Esse agendamento não foi encontrado.')
  if (agendamento.status !== 'confirmado') {
    throw new Error('Só dá pra editar os serviços de um horário confirmado que ainda não foi atendido.')
  }

  await db.delete(agendamentoServicos).where(eq(agendamentoServicos.agendamentoId, agendamentoId))
  await db.insert(agendamentoServicos).values(servicoIds.map((servicoId) => ({ agendamentoId, servicoId })))

  revalidarAgenda()
}

/** Registra que o atendimento aconteceu — equivalente ao "Registrar
 * atendimento" que já existia do lado do barbeiro, mas pro admin: o dono
 * navega pela agenda de qualquer barbeiro (inclusive a dele mesmo) por
 * aqui, sem precisar entrar numa área "barbeiro" separada. */
export async function registrarAtendimentoAdmin(
  agendamentoId: string,
  clienteId: string,
  nota: string,
  formaPagamento?: FormaPagamento,
  caixaDestinoBarbeiroId?: string,
) {
  await assertAdmin()

  const db = getDb()

  const rows = await db
    .update(agendamentos)
    .set({ status: 'atendido', formaPagamento, caixaDestinoBarbeiroId })
    .where(and(eq(agendamentos.id, agendamentoId), eq(agendamentos.status, 'confirmado')))
    .returning()
  if (rows.length === 0) throw new Error('Atendimento já registrado ou agendamento inválido.')
  const agendamento = rows[0]

  // Se esse agendamento ocupou mais de um slot (serviços com duração
  // somada), marca os slots de continuação como atendido também — é a
  // mesma visita.
  await db
    .update(agendamentos)
    .set({ status: 'atendido' })
    .where(and(eq(agendamentos.continuacaoDeId, agendamentoId), eq(agendamentos.status, 'confirmado')))

  const servicosDoAgendamento = await db
    .select()
    .from(agendamentoServicos)
    .where(eq(agendamentoServicos.agendamentoId, agendamentoId))
  if (servicosDoAgendamento.length === 0) throw new Error('Agendamento sem serviço associado.')

  const hojeISO = getHojeISO()
  await db.insert(haircutRecords).values(
    servicosDoAgendamento.map((s) => ({
      clienteId,
      barbeiroId: agendamento.barbeiroId,
      servicoId: s.servicoId,
      data: hojeISO,
      notas: nota.trim() || null,
    })),
  )

  await db
    .update(clientes)
    .set({
      loyaltyCortesAtual: sql`LEAST(${clientes.loyaltyCortesAtual} + 1, ${clientes.loyaltyCortesMeta})`,
    })
    .where(eq(clientes.id, clienteId))

  revalidarAgenda()
}
