'use server'

import { revalidatePath } from 'next/cache'
import { getDb } from '../db'
import { configuracoes } from '../db/schema'
import { assertAdmin } from '../lib/adminAuth'

export async function setMetaFaturamento(valor: number) {
  const dono = await assertAdmin()

  await getDb()
    .insert(configuracoes)
    .values({ barbeariaId: dono.barbeariaId, metaFaturamentoMensal: valor })
    .onConflictDoUpdate({
      target: configuracoes.barbeariaId,
      set: { metaFaturamentoMensal: valor },
    })

  revalidatePath('/admin/financeiro')
}
