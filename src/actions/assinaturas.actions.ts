'use server'

import { and, eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getDb } from '../db'
import { assinaturas, planosAssinatura, planoServicosInclusos } from '../db/schema'
import { assertAdmin } from '../lib/adminAuth'
import { cancelarAssinaturaComAsaas } from '../lib/asaasCancelamento'

export async function cancelarAssinatura(assinaturaId: string) {
  const dono = await assertAdmin()

  const [assinatura] = await getDb()
    .select({ id: assinaturas.id })
    .from(assinaturas)
    .where(and(eq(assinaturas.id, assinaturaId), eq(assinaturas.barbeariaId, dono.barbeariaId)))
    .limit(1)
  if (!assinatura) throw new Error('Assinatura não encontrada.')

  await cancelarAssinaturaComAsaas(assinaturaId)
  revalidatePath('/admin/assinaturas')
  revalidatePath('/cliente/perfil')
}

export async function reenviarCobranca(assinaturaId: string) {
  const dono = await assertAdmin()
  await getDb()
    .update(assinaturas)
    .set({ ultimoReenvioEm: new Date() })
    .where(and(eq(assinaturas.id, assinaturaId), eq(assinaturas.barbeariaId, dono.barbeariaId)))
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
  const dono = await assertAdmin()
  if (!nome.trim()) throw new Error('Nome é obrigatório')

  const db = getDb()
  const rows = await db
    .insert(planosAssinatura)
    .values({ barbeariaId: dono.barbeariaId, nome: nome.trim(), valorMensal })
    .returning()
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
  const dono = await assertAdmin()
  if (!nome.trim()) throw new Error('Nome é obrigatório')

  const db = getDb()
  await db
    .update(planosAssinatura)
    .set({ nome: nome.trim(), valorMensal })
    .where(and(eq(planosAssinatura.id, id), eq(planosAssinatura.barbeariaId, dono.barbeariaId)))

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
  const dono = await assertAdmin()
  await getDb()
    .update(planosAssinatura)
    .set({ ativo })
    .where(and(eq(planosAssinatura.id, id), eq(planosAssinatura.barbeariaId, dono.barbeariaId)))
  revalidarTelasDePlano()
}

export async function apagarPlano(id: string) {
  const dono = await assertAdmin()
  const db = getDb()

  const [plano] = await db
    .select({ id: planosAssinatura.id })
    .from(planosAssinatura)
    .where(and(eq(planosAssinatura.id, id), eq(planosAssinatura.barbeariaId, dono.barbeariaId)))
    .limit(1)
  if (!plano) throw new Error('Plano não encontrado.')

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
