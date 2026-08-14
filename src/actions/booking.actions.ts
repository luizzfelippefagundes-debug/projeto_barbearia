'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { getDb } from '../db'
import { agendamentos, assinaturas, haircutRecords } from '../db/schema'
import { getClienteRowByClerkId } from '../db/queries/clientePorClerkId'
import { getHojeISO } from '../lib/dateUtils'

async function getClienteAtualOuFalhar() {
  const { userId } = await auth()
  if (!userId) throw new Error('Não autenticado')
  const cliente = await getClienteRowByClerkId(userId)
  if (!cliente) throw new Error('Cliente não encontrado')
  return cliente
}

export async function agendarComoCliente(hora: string, barbeiroId: string, servicoId: string) {
  const cliente = await getClienteAtualOuFalhar()

  await getDb()
    .insert(agendamentos)
    .values({
      data: getHojeISO(),
      hora,
      barbeiroId,
      clienteId: cliente.id,
      servicoId,
      status: 'confirmado',
    })
    .onConflictDoUpdate({
      target: [agendamentos.data, agendamentos.hora, agendamentos.barbeiroId],
      set: { status: 'confirmado', clienteId: cliente.id, servicoId },
    })

  revalidatePath('/cliente/agendar')
  revalidatePath('/cliente/perfil')
  revalidatePath('/admin/agenda')
}

export async function avaliarVisita(historicoId: string, rating: 'up' | 'down') {
  await getClienteAtualOuFalhar()

  await getDb().update(haircutRecords).set({ avaliacao: rating }).where(eq(haircutRecords.id, historicoId))

  revalidatePath('/cliente/perfil')
}

export async function cancelarMinhaAssinatura(assinaturaId: string) {
  await getClienteAtualOuFalhar()

  await getDb().update(assinaturas).set({ status: 'cancelado' }).where(eq(assinaturas.id, assinaturaId))

  revalidatePath('/cliente/perfil')
  revalidatePath('/admin/assinaturas')
}
