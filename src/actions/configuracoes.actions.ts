'use server'

import { revalidatePath } from 'next/cache'
import { getDb } from '../db'
import { configuracoes } from '../db/schema'
import { assertAdmin } from '../lib/adminAuth'

export async function setMetaFaturamento(valor: number) {
  await assertAdmin()

  await getDb()
    .insert(configuracoes)
    .values({ id: 'default', metaFaturamentoMensal: valor })
    .onConflictDoUpdate({
      target: configuracoes.id,
      set: { metaFaturamentoMensal: valor },
    })

  revalidatePath('/admin/financeiro')
}
