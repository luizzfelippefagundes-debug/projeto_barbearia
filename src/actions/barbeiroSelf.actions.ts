'use server'

import { and, eq, gte, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { put } from '@vercel/blob'
import { getDb } from '../db'
import { agendamentos, haircutRecords, clientes, produtos, vendas } from '../db/schema'
import { assertBarbeiroLogado } from '../lib/barbeiroAuth'
import { getHojeISO } from '../lib/dateUtils'

export async function registrarMeuAtendimento(formData: FormData) {
  const barbeiro = await assertBarbeiroLogado()

  const agendamentoId = String(formData.get('agendamentoId') ?? '')
  const clienteId = String(formData.get('clienteId') ?? '')
  const servicoId = String(formData.get('servicoId') ?? '')
  const nota = String(formData.get('nota') ?? '').trim()
  const foto = formData.get('foto')

  if (!agendamentoId || !clienteId || !servicoId) throw new Error('Dados incompletos')

  const db = getDb()

  const rows = await db
    .update(agendamentos)
    .set({ status: 'atendido' })
    .where(
      and(
        eq(agendamentos.id, agendamentoId),
        eq(agendamentos.barbeiroId, barbeiro.id),
        eq(agendamentos.status, 'confirmado'),
      ),
    )
    .returning()
  if (rows.length === 0) throw new Error('Atendimento já registrado ou agendamento inválido.')

  let fotoUrl: string | undefined
  if (foto instanceof File && foto.size > 0) {
    const blob = await put(`atendimentos/${clienteId}-${Date.now()}-${foto.name}`, foto, {
      access: 'public',
    })
    fotoUrl = blob.url
  }

  await db.insert(haircutRecords).values({
    clienteId,
    barbeiroId: barbeiro.id,
    servicoId,
    data: getHojeISO(),
    notas: nota || null,
    fotoUrl: fotoUrl ?? null,
  })

  await db
    .update(clientes)
    .set({
      loyaltyCortesAtual: sql`LEAST(${clientes.loyaltyCortesAtual} + 1, ${clientes.loyaltyCortesMeta})`,
    })
    .where(eq(clientes.id, clienteId))

  revalidatePath('/barbeiro/agenda')
  revalidatePath('/admin/agenda')
}

export async function registrarMinhaVenda(produtoId: string, quantidade: number, clienteId?: string) {
  const barbeiro = await assertBarbeiroLogado()
  if (quantidade <= 0) throw new Error('Quantidade inválida')

  const db = getDb()

  const produto = (await db.select().from(produtos).where(eq(produtos.id, produtoId)).limit(1))[0]
  if (!produto) throw new Error('Produto não encontrado')

  const qtd = Math.min(quantidade, produto.estoque)
  if (qtd <= 0) throw new Error('Sem estoque disponível')

  await db
    .update(produtos)
    .set({ estoque: sql`${produtos.estoque} - ${qtd}` })
    .where(and(eq(produtos.id, produtoId), gte(produtos.estoque, qtd)))

  await db.insert(vendas).values({
    produtoId,
    barbeiroId: barbeiro.id,
    clienteId: clienteId || null,
    quantidade: qtd,
    data: getHojeISO(),
    valorTotal: produto.precoVenda * qtd,
  })

  revalidatePath('/barbeiro/produtos')
}
