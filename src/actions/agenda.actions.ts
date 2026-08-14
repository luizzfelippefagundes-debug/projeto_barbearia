'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getDb } from '../db'
import { agendamentos, filaEspera } from '../db/schema'
import { assertAdmin } from '../lib/adminAuth'

export async function criarOuAtualizarHorario(
  data: string,
  hora: string,
  barbeiroId: string,
  clienteId?: string,
  servicoId?: string,
) {
  await assertAdmin()

  await getDb()
    .insert(agendamentos)
    .values({
      data,
      hora,
      barbeiroId,
      clienteId: clienteId || null,
      servicoId: servicoId || null,
      status: 'confirmado',
    })
    .onConflictDoUpdate({
      target: [agendamentos.data, agendamentos.hora, agendamentos.barbeiroId],
      set: {
        status: 'confirmado',
        clienteId: clienteId || null,
        servicoId: servicoId || null,
      },
    })

  revalidatePath('/admin/agenda')
  revalidatePath('/cliente/agendar')
}

export async function notificarFila(filaId: string) {
  await assertAdmin()
  await getDb().update(filaEspera).set({ notificado: true }).where(eq(filaEspera.id, filaId))
  revalidatePath('/admin/agenda')
}
