'use server'

import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { getDb } from '../db'
import { agendamentos, assinaturas, haircutRecords } from '../db/schema'
import { getClienteAtualOuFalhar } from '../lib/clienteAuth'
import { cancelarAssinaturaComAsaas } from '../lib/asaasCancelamento'
import { criarAgendamentoComServicos } from '../lib/agendaBooking'
import { registrarAvisoCancelamento } from '../lib/avisoBarbeiro'
import { addDays, getHojeISO, getHoraAtualBrasil } from '../lib/dateUtils'

/** Cliente só pode agendar hoje + os próximos 6 dias — mesma janela
 * aplicada na tela de agendar (validado aqui de novo porque essa action
 * pode ser chamada direto, sem passar pela tela). */
const JANELA_DIAS_AGENDAMENTO = 6

export async function agendarComoCliente(hora: string, barbeiroId: string, servicoIds: string[], data: string) {
  const cliente = await getClienteAtualOuFalhar()

  const hojeISO = getHojeISO()
  const maxData = addDays(hojeISO, JANELA_DIAS_AGENDAMENTO)
  if (data < hojeISO || data > maxData) {
    throw new Error('Só dá pra agendar de hoje até 7 dias à frente.')
  }
  if (data === hojeISO && hora <= getHoraAtualBrasil()) {
    throw new Error('Esse horário já passou — escolha outro.')
  }

  await criarAgendamentoComServicos({
    data,
    hora,
    barbeiroId,
    clienteId: cliente.id,
    servicoIds,
  })

  revalidatePath('/cliente/agendar')
  revalidatePath('/cliente/perfil')
  revalidatePath('/admin/agenda')
  revalidatePath('/barbeiro/agenda')
}

/** Cliente cancela o próprio agendamento pelo site — mesmo efeito de
 * cancelar pelo bot do WhatsApp: apaga a linha (e continuações, em
 * cascata) e libera o horário pra qualquer um marcar. */
export async function cancelarMeuAgendamento(agendamentoId: string) {
  const cliente = await getClienteAtualOuFalhar()

  const existente = await getDb().select().from(agendamentos).where(eq(agendamentos.id, agendamentoId)).limit(1)
  if (!existente[0] || existente[0].clienteId !== cliente.id) {
    throw new Error('Agendamento não encontrado.')
  }

  await registrarAvisoCancelamento({
    agendamentoId,
    barbeiroId: existente[0].barbeiroId,
    clienteNome: cliente.nome,
    data: existente[0].data,
    hora: existente[0].hora,
  })

  await getDb().delete(agendamentos).where(eq(agendamentos.id, agendamentoId))

  revalidatePath('/cliente/perfil')
  revalidatePath('/admin/agenda')
  revalidatePath('/barbeiro/agenda')
}

export async function avaliarVisita(historicoId: string, rating: 'up' | 'down') {
  await getClienteAtualOuFalhar()

  await getDb().update(haircutRecords).set({ avaliacao: rating }).where(eq(haircutRecords.id, historicoId))

  revalidatePath('/cliente/perfil')
}

export async function cancelarMinhaAssinatura(assinaturaId: string) {
  const cliente = await getClienteAtualOuFalhar()

  const rows = await getDb().select().from(assinaturas).where(eq(assinaturas.id, assinaturaId)).limit(1)
  const assinatura = rows[0]
  if (!assinatura || assinatura.clienteId !== cliente.id) {
    throw new Error('Assinatura não encontrada')
  }

  await cancelarAssinaturaComAsaas(assinaturaId)

  revalidatePath('/cliente/perfil')
  revalidatePath('/admin/assinaturas')
}
