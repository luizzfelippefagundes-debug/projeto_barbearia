import { eq } from 'drizzle-orm'
import { getDb } from '../db'
import { assinaturas } from '../db/schema'
import { cancelarAssinaturaAsaas } from './asaas'

/** Cancela a assinatura no Asaas primeiro (se ela tiver uma cobrança
 * recorrente lá) e só depois marca como cancelada no nosso banco — assim
 * nunca fica um "cancelado" falso enquanto o Asaas continua cobrando. */
export async function cancelarAssinaturaComAsaas(assinaturaId: string) {
  const db = getDb()
  const rows = await db.select().from(assinaturas).where(eq(assinaturas.id, assinaturaId)).limit(1)
  const assinatura = rows[0]
  if (!assinatura) throw new Error('Assinatura não encontrada')

  if (assinatura.asaasSubscriptionId) {
    await cancelarAssinaturaAsaas(assinatura.asaasSubscriptionId)
  }

  await db.update(assinaturas).set({ status: 'cancelado' }).where(eq(assinaturas.id, assinaturaId))
}
