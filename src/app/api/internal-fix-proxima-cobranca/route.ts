import { eq, inArray } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { getDb } from '../../../db'
import { assinaturas } from '../../../db/schema'
import { buscarAssinatura } from '../../../lib/asaas'

/** Endpoint temporário, uso único — corrige `proximaCobranca` travada de
 * assinaturas já existentes (o webhook só atualizava `status`, nunca essa
 * data). Remover depois de rodar uma vez. Protegido por token pra não ficar
 * exposto publicamente. */
export async function POST(req: Request) {
  const token = req.headers.get('x-fix-token')
  if (!token || token !== process.env.INTERNAL_FIX_TOKEN) {
    return NextResponse.json({ error: 'não autorizado' }, { status: 401 })
  }

  const db = getDb()
  const alvos = await db
    .select({ id: assinaturas.id, asaasSubscriptionId: assinaturas.asaasSubscriptionId, proximaCobranca: assinaturas.proximaCobranca })
    .from(assinaturas)
    .where(inArray(assinaturas.status, ['em_dia', 'atrasado']))

  const resultados: Array<{ id: string; ok: boolean; de?: string; para?: string; erro?: string }> = []

  for (const a of alvos) {
    if (!a.asaasSubscriptionId) {
      resultados.push({ id: a.id, ok: false, erro: 'sem asaasSubscriptionId' })
      continue
    }
    try {
      const assinaturaAsaas = await buscarAssinatura(a.asaasSubscriptionId)
      if (assinaturaAsaas.nextDueDate !== a.proximaCobranca) {
        await db
          .update(assinaturas)
          .set({ proximaCobranca: assinaturaAsaas.nextDueDate })
          .where(eq(assinaturas.id, a.id))
      }
      resultados.push({ id: a.id, ok: true, de: a.proximaCobranca, para: assinaturaAsaas.nextDueDate })
    } catch (err) {
      resultados.push({ id: a.id, ok: false, erro: err instanceof Error ? err.message : 'erro desconhecido' })
    }
  }

  return NextResponse.json({ total: alvos.length, resultados })
}
