import { eq } from 'drizzle-orm'
import { getDb } from '../db'
import { agendamentoServicos, avisosBarbeiro, barbeiros, servicos } from '../db/schema'
import { formatDateDisplay } from './dateUtils'

/** Grava um aviso pendente pro bot do WhatsApp mandar pro barbeiro — usado
 * quando um cancelamento acontece PELO SITE (não pelo bot), já que o bot
 * roda numa rede separada (VPS) e não sabe que isso aconteceu na hora. O
 * bot verifica essa fila periodicamente (mesmo esquema já usado pros
 * lembretes). Precisa ser chamado ANTES de apagar o agendamento, senão os
 * serviços ligados a ele já foram embora (cascade). Não faz nada se o
 * barbeiro não tiver telefone cadastrado. */
export async function registrarAvisoCancelamento(params: {
  agendamentoId: string
  barbeiroId: string
  clienteNome: string
  data: string
  hora: string
}) {
  const db = getDb()
  const [barbeiro] = await db.select().from(barbeiros).where(eq(barbeiros.id, params.barbeiroId)).limit(1)
  if (!barbeiro?.telefone) return

  const servicosLigados = await db
    .select({ nome: servicos.nome })
    .from(agendamentoServicos)
    .innerJoin(servicos, eq(servicos.id, agendamentoServicos.servicoId))
    .where(eq(agendamentoServicos.agendamentoId, params.agendamentoId))

  const servicosTexto = servicosLigados.map((s) => s.nome).join(' + ')
  const mensagem =
    `❌ Cancelamento: ${formatDateDisplay(params.data)} às ${params.hora.slice(0, 5)}` +
    (servicosTexto ? ` (${servicosTexto})` : '') +
    ` — ${params.clienteNome}. O horário já está livre de novo.`

  await db.insert(avisosBarbeiro).values({ barbeiroTelefone: barbeiro.telefone, mensagem })
}
