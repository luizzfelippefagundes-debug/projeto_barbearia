'use server'

import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { getDb } from '../db'
import { agendamentos, assinaturas, haircutRecords } from '../db/schema'
import { getClienteAtualOuFalhar } from '../lib/clienteAuth'
import { cancelarAssinaturaComAsaas } from '../lib/asaasCancelamento'
import { getHojeISO } from '../lib/dateUtils'

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
