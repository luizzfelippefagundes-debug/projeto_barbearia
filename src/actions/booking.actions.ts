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

/** Todas as ações desse arquivo devolvem `{ error }` em vez de lançar
 * exceção — em produção, o Next.js esconde a mensagem de erros lançados
 * numa Server Action (vira "Minified React error #441"), então a única
 * forma confiável do cliente ver a mensagem certa é como dado de
 * retorno normal. */
type Resultado = { error?: string }

/** Cliente só pode agendar hoje + os próximos 6 dias — mesma janela
 * aplicada na tela de agendar (validado aqui de novo porque essa action
 * pode ser chamada direto, sem passar pela tela). */
const JANELA_DIAS_AGENDAMENTO = 6

export async function agendarComoCliente(
  hora: string,
  barbeiroId: string,
  servicoIds: string[],
  data: string,
): Promise<Resultado> {
  const cliente = await getClienteAtualOuFalhar()

  const hojeISO = getHojeISO()
  const maxData = addDays(hojeISO, JANELA_DIAS_AGENDAMENTO)
  if (data < hojeISO || data > maxData) {
    return { error: 'Só dá pra agendar de hoje até 7 dias à frente.' }
  }
  if (data === hojeISO && hora <= getHoraAtualBrasil()) {
    return { error: 'Esse horário já passou — escolha outro.' }
  }

  try {
    await criarAgendamentoComServicos({
      data,
      hora,
      barbeiroId,
      clienteId: cliente.id,
      servicoIds,
      barbeariaId: cliente.barbeariaId,
    })
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Não foi possível agendar.' }
  }

  revalidatePath('/cliente/agendar')
  revalidatePath('/cliente/perfil')
  revalidatePath('/admin/agenda')
  revalidatePath('/barbeiro/agenda')
  return {}
}

/** Cliente cancela o próprio agendamento pelo site — mesmo efeito de
 * cancelar pelo bot do WhatsApp: apaga a linha (e continuações, em
 * cascata) e libera o horário pra qualquer um marcar. */
export async function cancelarMeuAgendamento(agendamentoId: string): Promise<Resultado> {
  const cliente = await getClienteAtualOuFalhar()

  const existente = await getDb().select().from(agendamentos).where(eq(agendamentos.id, agendamentoId)).limit(1)
  if (!existente[0] || existente[0].clienteId !== cliente.id) {
    return { error: 'Agendamento não encontrado.' }
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
  return {}
}

export async function avaliarVisita(historicoId: string, rating: 'up' | 'down'): Promise<Resultado> {
  await getClienteAtualOuFalhar()

  await getDb().update(haircutRecords).set({ avaliacao: rating }).where(eq(haircutRecords.id, historicoId))

  revalidatePath('/cliente/perfil')
  return {}
}

export async function cancelarMinhaAssinatura(assinaturaId: string): Promise<Resultado> {
  const cliente = await getClienteAtualOuFalhar()

  const rows = await getDb().select().from(assinaturas).where(eq(assinaturas.id, assinaturaId)).limit(1)
  const assinatura = rows[0]
  if (!assinatura || assinatura.clienteId !== cliente.id) {
    return { error: 'Assinatura não encontrada' }
  }

  try {
    await cancelarAssinaturaComAsaas(assinaturaId)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Não foi possível cancelar a assinatura.' }
  }

  revalidatePath('/cliente/perfil')
  revalidatePath('/admin/assinaturas')
  return {}
}
