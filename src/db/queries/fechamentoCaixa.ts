import { and, eq } from 'drizzle-orm'
import { getDb } from '../index'
import { barbeiros, fechamentosCaixa } from '../schema'

export interface FechamentoCaixaSalvo {
  avulso: number
  produtos: number
  assinatura: number
  total: number
  fechadoEm: string
  fechadoPorNome?: string
}

export async function getFechamentoCaixaSalvo(dataISO: string, barbeariaId: string): Promise<FechamentoCaixaSalvo | null> {
  const rows = await getDb()
    .select({
      avulso: fechamentosCaixa.avulso,
      produtos: fechamentosCaixa.produtos,
      assinatura: fechamentosCaixa.assinatura,
      total: fechamentosCaixa.total,
      fechadoEm: fechamentosCaixa.fechadoEm,
      fechadoPorNome: barbeiros.nome,
    })
    .from(fechamentosCaixa)
    .leftJoin(barbeiros, eq(fechamentosCaixa.fechadoPorBarbeiroId, barbeiros.id))
    .where(and(eq(fechamentosCaixa.data, dataISO), eq(fechamentosCaixa.barbeariaId, barbeariaId)))
    .limit(1)

  const row = rows[0]
  if (!row) return null

  return {
    avulso: row.avulso,
    produtos: row.produtos,
    assinatura: row.assinatura,
    total: row.total,
    fechadoEm: row.fechadoEm.toISOString(),
    fechadoPorNome: row.fechadoPorNome ?? undefined,
  }
}
