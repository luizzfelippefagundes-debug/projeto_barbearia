'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getDb } from '../db'
import { fechamentosCaixa } from '../db/schema'
import { assertAdmin } from '../lib/adminAuth'
import { getFechamentoCaixaDoDia } from '../lib/derive'
import { getAgendamentosDoDia } from '../db/queries/agendamentos'
import { getServicosAtivos } from '../db/queries/servicos'
import { getVendas } from '../db/queries/vendas'
import { getAssinaturas, getPlanosAssinatura } from '../db/queries/assinaturas'
import { getClientesResumo } from '../db/queries/clientes'

export async function fecharCaixaDoDia(dataISO: string) {
  const barbeiro = await assertAdmin()

  const [agendamentos, servicos, vendas, assinaturas, planos, clientes] = await Promise.all([
    getAgendamentosDoDia(dataISO, barbeiro.barbeariaId),
    getServicosAtivos(barbeiro.barbeariaId),
    getVendas(barbeiro.barbeariaId),
    getAssinaturas(barbeiro.barbeariaId),
    getPlanosAssinatura(barbeiro.barbeariaId),
    getClientesResumo(barbeiro.barbeariaId),
  ])

  const fechamento = getFechamentoCaixaDoDia(
    agendamentos,
    servicos,
    vendas,
    assinaturas,
    planos,
    clientes,
    dataISO,
  )

  await getDb()
    .insert(fechamentosCaixa)
    .values({
      barbeariaId: barbeiro.barbeariaId,
      data: dataISO,
      avulso: fechamento.avulso,
      produtos: fechamento.produtos,
      assinatura: fechamento.assinatura,
      total: fechamento.total,
      fechadoPorBarbeiroId: barbeiro.id,
    })
    .onConflictDoNothing()

  revalidatePath('/admin/financeiro')
}

export async function reabrirCaixaDoDia(dataISO: string) {
  const dono = await assertAdmin()
  await getDb()
    .delete(fechamentosCaixa)
    .where(and(eq(fechamentosCaixa.data, dataISO), eq(fechamentosCaixa.barbeariaId, dono.barbeariaId)))
  revalidatePath('/admin/financeiro')
}
