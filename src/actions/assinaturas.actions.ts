'use server'

import { eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getDb } from '../db'
import { assinaturas, planosAssinatura, planoServicosInclusos } from '../db/schema'
import { assertAdmin } from '../lib/adminAuth'
import { cancelarAssinaturaComAsaas } from '../lib/asaasCancelamento'

export async function cancelarAssinatura(assinaturaId: string) {
  await assertAdmin()
  await cancelarAssinaturaComAsaas(assinaturaId)
  revalidatePath('/admin/assinaturas')
  revalidatePath('/cliente/perfil')
}

export async function reenviarCobranca(assinaturaId: string) {
  await assertAdmin()
  await getDb()
    .update(assinaturas)
    .set({ ultimoReenvioEm: new Date() })
    .where(eq(assinaturas.id, assinaturaId))
  revalidatePath('/admin/assinaturas')
}

function revalidarTelasDePlano() {
  revalidatePath('/admin/assinaturas')
  revalidatePath('/admin/servicos')
  revalidatePath('/cliente/assinar')
  revalidatePath('/cliente/perfil')
}

export async function criarPlano(
  nome: string,
  valorMensal: number,
  servicosInclusos: Array<{ servicoId: string; limiteMensal: number | null }>,
) {
  await assertAdmin()
  if (!nome.trim()) throw new Error('Nome é obrigatório')

  const db = getDb()
  const rows = await db.insert(planosAssinatura).values({ nome: nome.trim(), valorMensal }).returning()
  const plano = rows[0]

  if (servicosInclusos.length > 0) {
    await db.insert(planoServicosInclusos).values(
      servicosInclusos.map((s) => ({
        planoId: plano.id,
        servicoId: s.servicoId,
        limiteMensal: s.limiteMensal,
      })),
    )
  }

  revalidarTelasDePlano()
  return plano
}

export async function atualizarPlano(
  id: string,
  nome: string,
  valorMensal: number,
  servicosInclusos: Array<{ servicoId: string; limiteMensal: number | null }>,
) {
  await assertAdmin()
  if (!nome.trim()) throw new Error('Nome é obrigatório')

  const db = getDb()
  await db.update(planosAssinatura).set({ nome: nome.trim(), valorMensal }).where(eq(planosAssinatura.id, id))

  // Refaz a lista de serviços inclusos do zero — mais simples e seguro do
  // que tentar diferenciar o que mudou item a item.
  await db.delete(planoServicosInclusos).where(eq(planoServicosInclusos.planoId, id))
  if (servicosInclusos.length > 0) {
    await db.insert(planoServicosInclusos).values(
      servicosInclusos.map((s) => ({
        planoId: id,
        servicoId: s.servicoId,
        limiteMensal: s.limiteMensal,
      })),
    )
  }

  revalidarTelasDePlano()
}

export async function toggleAtivoPlano(id: string, ativo: boolean) {
  await assertAdmin()
  await getDb().update(planosAssinatura).set({ ativo }).where(eq(planosAssinatura.id, id))
  revalidarTelasDePlano()
}

export async function apagarPlano(id: string) {
  await assertAdmin()
  const db = getDb()

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(assinaturas)
    .where(eq(assinaturas.planoId, id))

  if (total > 0) {
    throw new Error(
      `Esse plano já teve ${total} assinatura(s) vinculada(s) — não dá pra apagar. Desative em vez disso.`,
    )
  }

  await db.delete(planosAssinatura).where(eq(planosAssinatura.id, id))
  revalidarTelasDePlano()
}
