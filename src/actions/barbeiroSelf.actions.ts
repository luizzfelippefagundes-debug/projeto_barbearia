'use server'

import { and, eq, gte, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { put } from '@vercel/blob'
import { getDb } from '../db'
import { agendamentos, agendamentoServicos, haircutRecords, clientes, produtos, vendas, barbeiros } from '../db/schema'
import { assertBarbeiroLogado } from '../lib/barbeiroAuth'
import { criarAgendamentoComServicos } from '../lib/agendaBooking'
import { gerarCodigoIndicacao } from '../lib/codigoIndicacao'
import { getHojeISO, TIME_SLOTS } from '../lib/dateUtils'
import type { FormaPagamento } from '../types'

/** Todas as ações desse arquivo devolvem `{ error }` em vez de lançar
 * exceção nas validações — em produção, o Next.js esconde a mensagem de
 * erros lançados numa Server Action (vira "Minified React error #441"),
 * então a única forma confiável do cliente ver a mensagem certa é como
 * dado de retorno normal. */
type Resultado = { error?: string }

function revalidarAgenda() {
  revalidatePath('/admin/agenda')
  revalidatePath('/barbeiro/agenda')
  revalidatePath('/cliente/agendar')
}

/** Bloqueia um horário da própria agenda (ex: almoço, compromisso) — o
 * barbeiro só consegue mexer nos próprios horários, nunca nos de outro. */
export async function bloquearMeuHorario(data: string, hora: string): Promise<Resultado> {
  const barbeiro = await assertBarbeiroLogado()

  const db = getDb()
  const existente = await db
    .select()
    .from(agendamentos)
    .where(and(eq(agendamentos.data, data), eq(agendamentos.hora, hora), eq(agendamentos.barbeiroId, barbeiro.id)))
    .limit(1)
  if (existente[0]?.status === 'confirmado' || existente[0]?.status === 'atendido') {
    return { error: 'Esse horário já tem um cliente marcado — peça pro dono cancelar antes de bloquear.' }
  }

  await db
    .insert(agendamentos)
    .values({ data, hora, barbeiroId: barbeiro.id, status: 'bloqueado', clienteId: null, barbeariaId: barbeiro.barbeariaId })
    .onConflictDoUpdate({
      target: [agendamentos.data, agendamentos.hora, agendamentos.barbeiroId],
      set: { status: 'bloqueado', clienteId: null },
    })

  revalidarAgenda()
  return {}
}

export async function desbloquearMeuHorario(data: string, hora: string): Promise<Resultado> {
  const barbeiro = await assertBarbeiroLogado()

  await getDb()
    .delete(agendamentos)
    .where(
      and(
        eq(agendamentos.data, data),
        eq(agendamentos.hora, hora),
        eq(agendamentos.barbeiroId, barbeiro.id),
        eq(agendamentos.status, 'bloqueado'),
      ),
    )

  revalidarAgenda()
  return {}
}

/** Bloqueia o dia inteiro da própria agenda (folga, feriado) — pula
 * qualquer horário que já tenha cliente marcado. */
export async function bloquearMeuDiaInteiro(data: string): Promise<Resultado> {
  const barbeiro = await assertBarbeiroLogado()

  const db = getDb()
  const existentes = await db
    .select()
    .from(agendamentos)
    .where(and(eq(agendamentos.data, data), eq(agendamentos.barbeiroId, barbeiro.id)))
  const ocupados = new Set(
    existentes.filter((a) => a.status === 'confirmado' || a.status === 'atendido').map((a) => a.hora),
  )

  for (const hora of TIME_SLOTS) {
    if (ocupados.has(hora)) continue
    await db
      .insert(agendamentos)
      .values({ data, hora, barbeiroId: barbeiro.id, status: 'bloqueado', clienteId: null, barbeariaId: barbeiro.barbeariaId })
      .onConflictDoUpdate({
        target: [agendamentos.data, agendamentos.hora, agendamentos.barbeiroId],
        set: { status: 'bloqueado', clienteId: null },
      })
  }

  revalidarAgenda()
  return {}
}

export async function desbloquearMeuDiaInteiro(data: string): Promise<Resultado> {
  const barbeiro = await assertBarbeiroLogado()

  await getDb()
    .delete(agendamentos)
    .where(
      and(
        eq(agendamentos.data, data),
        eq(agendamentos.barbeiroId, barbeiro.id),
        eq(agendamentos.status, 'bloqueado'),
      ),
    )

  revalidarAgenda()
  return {}
}

/** Marca que o cliente confirmado não apareceu — o barbeiro só consegue
 * fazer isso nos próprios horários. Ver marcarNaoCompareceu (versão do
 * dono) pra mais contexto. */
export async function marcarMeuNaoCompareceu(agendamentoId: string): Promise<Resultado> {
  const barbeiro = await assertBarbeiroLogado()

  const db = getDb()
  const rows = await db
    .update(agendamentos)
    .set({ status: 'nao_compareceu' })
    .where(
      and(
        eq(agendamentos.id, agendamentoId),
        eq(agendamentos.barbeiroId, barbeiro.id),
        eq(agendamentos.status, 'confirmado'),
      ),
    )
    .returning()
  if (rows.length === 0) return { error: 'Esse agendamento não está mais confirmado.' }

  await db
    .update(agendamentos)
    .set({ status: 'nao_compareceu' })
    .where(and(eq(agendamentos.continuacaoDeId, agendamentoId), eq(agendamentos.status, 'confirmado')))

  revalidarAgenda()
  return {}
}

/** Cancela um agendamento de verdade (apaga, libera o horário) — o
 * barbeiro só consegue cancelar os próprios horários. Funciona tanto pra
 * "confirmado" quanto pra "não compareceu" que ele queira limpar da agenda. */
export async function cancelarMeuAgendamentoComoBarbeiro(agendamentoId: string): Promise<Resultado> {
  const barbeiro = await assertBarbeiroLogado()

  const rows = await getDb()
    .delete(agendamentos)
    .where(and(eq(agendamentos.id, agendamentoId), eq(agendamentos.barbeiroId, barbeiro.id)))
    .returning()
  if (rows.length === 0) return { error: 'Esse agendamento não foi encontrado.' }

  revalidarAgenda()
  return {}
}

export async function registrarMeuAtendimento(formData: FormData): Promise<Resultado> {
  const barbeiro = await assertBarbeiroLogado()

  const agendamentoId = String(formData.get('agendamentoId') ?? '')
  const clienteId = String(formData.get('clienteId') ?? '')
  const nota = String(formData.get('nota') ?? '').trim()
  const foto = formData.get('foto')
  const formaPagamento = (formData.get('formaPagamento') || undefined) as FormaPagamento | undefined
  const caixaDestinoBarbeiroId = (formData.get('caixaDestinoBarbeiroId') || undefined) as string | undefined

  if (!agendamentoId || !clienteId) return { error: 'Dados incompletos' }

  const db = getDb()

  const rows = await db
    .update(agendamentos)
    .set({ status: 'atendido', formaPagamento, caixaDestinoBarbeiroId })
    .where(
      and(
        eq(agendamentos.id, agendamentoId),
        eq(agendamentos.barbeiroId, barbeiro.id),
        eq(agendamentos.status, 'confirmado'),
      ),
    )
    .returning()
  if (rows.length === 0) return { error: 'Atendimento já registrado ou agendamento inválido.' }

  // Se esse agendamento ocupou mais de um slot (serviços com duração
  // somada), marca os slots de continuação como atendido também — é a
  // mesma visita.
  await db
    .update(agendamentos)
    .set({ status: 'atendido' })
    .where(and(eq(agendamentos.continuacaoDeId, agendamentoId), eq(agendamentos.status, 'confirmado')))

  const servicosDoAgendamento = await db
    .select()
    .from(agendamentoServicos)
    .where(eq(agendamentoServicos.agendamentoId, agendamentoId))
  if (servicosDoAgendamento.length === 0) return { error: 'Agendamento sem serviço associado.' }

  let fotoUrl: string | undefined
  if (foto instanceof File && foto.size > 0) {
    const blob = await put(`atendimentos/${clienteId}-${Date.now()}-${foto.name}`, foto, {
      access: 'public',
    })
    fotoUrl = blob.url
  }

  const hojeISO = getHojeISO()
  await db.insert(haircutRecords).values(
    servicosDoAgendamento.map((s) => ({
      barbeariaId: barbeiro.barbeariaId,
      clienteId,
      barbeiroId: barbeiro.id,
      servicoId: s.servicoId,
      data: hojeISO,
      notas: nota || null,
      fotoUrl: fotoUrl ?? null,
    })),
  )

  await db
    .update(clientes)
    .set({
      loyaltyCortesAtual: sql`LEAST(${clientes.loyaltyCortesAtual} + 1, ${clientes.loyaltyCortesMeta})`,
    })
    .where(eq(clientes.id, clienteId))

  revalidatePath('/barbeiro/agenda')
  revalidatePath('/admin/agenda')
  return {}
}

export async function atualizarMeuNome(nome: string): Promise<Resultado> {
  const barbeiro = await assertBarbeiroLogado()
  if (!nome.trim()) return { error: 'Nome é obrigatório' }

  await getDb().update(barbeiros).set({ nome: nome.trim() }).where(eq(barbeiros.id, barbeiro.id))
  revalidatePath('/barbeiro/perfil')
  revalidatePath('/admin/barbeiros')
  revalidatePath('/cliente/agendar')
  return {}
}

/** Só filtra o que aparece pro CLIENTE agendar — a própria agenda continua
 * livre pra marcar/bloquear qualquer horário manualmente. */
export async function atualizarMeuHorarioTrabalho(
  diasTrabalho: number[],
  horaInicio: string,
  horaFim: string,
): Promise<Resultado> {
  const barbeiro = await assertBarbeiroLogado()
  if (diasTrabalho.length === 0) return { error: 'Escolha pelo menos um dia da semana.' }
  if (horaInicio >= horaFim) return { error: 'O horário de início precisa ser antes do de fim.' }

  await getDb().update(barbeiros).set({ diasTrabalho, horaInicio, horaFim }).where(eq(barbeiros.id, barbeiro.id))
  revalidatePath('/barbeiro/perfil')
  revalidatePath('/admin/barbeiros')
  revalidatePath('/cliente/agendar')
  return {}
}

/** Meta pessoal de comissão do mês — só o próprio barbeiro define/vê, não
 * aparece pro dono nem afeta a meta de faturamento da loja. */
export async function atualizarMinhaMetaComissao(valor: number): Promise<Resultado> {
  const barbeiro = await assertBarbeiroLogado()
  if (valor < 0) return { error: 'A meta não pode ser negativa.' }

  await getDb()
    .update(barbeiros)
    .set({ metaComissaoMensal: valor > 0 ? valor : null })
    .where(eq(barbeiros.id, barbeiro.id))
  revalidatePath('/barbeiro/comissao')
  return {}
}

export async function atualizarMinhaFoto(foto: File): Promise<Resultado> {
  const barbeiro = await assertBarbeiroLogado()
  if (!(foto instanceof File) || foto.size === 0) return { error: 'Selecione uma foto' }

  const blob = await put(`barbeiros/${barbeiro.id}-${Date.now()}-${foto.name}`, foto, { access: 'public' })
  await getDb().update(barbeiros).set({ avatarUrl: blob.url }).where(eq(barbeiros.id, barbeiro.id))

  revalidatePath('/barbeiro/perfil')
  revalidatePath('/admin/barbeiros')
  revalidatePath('/cliente/agendar')
  return {}
}

/** Registra um atendimento avulso (comanda) — cliente que sentou na cadeira
 * sem hora marcada, seja porque chegou sem agendar ou porque tomou o lugar
 * de alguém que não veio. Diferente do fluxo normal de agendamento, entra
 * direto como "atendido" (já aconteceu), sem passar por "confirmado". */
export async function criarAtendimentoAvulso(params: {
  clienteId?: string
  nomeNovoCliente?: string
  telefoneNovoCliente?: string
  servicoIds: string[]
  hora: string
  formaPagamento: FormaPagamento
  caixaDestinoBarbeiroId: string
}): Promise<Resultado & { id?: string }> {
  const barbeiro = await assertBarbeiroLogado()
  const { servicoIds, hora, formaPagamento, caixaDestinoBarbeiroId } = params
  if (servicoIds.length === 0) return { error: 'Escolha pelo menos um serviço.' }
  if (!formaPagamento) return { error: 'Escolha a forma de pagamento.' }
  if (!caixaDestinoBarbeiroId) return { error: 'Escolha pra qual caixa foi.' }

  const db = getDb()

  let clienteId = params.clienteId
  if (!clienteId) {
    if (!params.nomeNovoCliente?.trim()) return { error: 'Escolha um cliente ou digite o nome de um novo.' }
    const [novoCliente] = await db
      .insert(clientes)
      .values({
        barbeariaId: barbeiro.barbeariaId,
        nome: params.nomeNovoCliente.trim(),
        telefone: (params.telefoneNovoCliente ?? '').trim(),
        codigoIndicacao: gerarCodigoIndicacao(),
      })
      .returning()
    clienteId = novoCliente.id
  }

  const hojeISO = getHojeISO()
  let anchor: { id: string }
  try {
    anchor = await criarAgendamentoComServicos({
      data: hojeISO,
      hora,
      barbeiroId: barbeiro.id,
      clienteId,
      servicoIds,
      barbeariaId: barbeiro.barbeariaId,
      status: 'atendido',
      formaPagamento,
      caixaDestinoBarbeiroId,
    })
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Não foi possível registrar o atendimento.' }
  }

  await db.insert(haircutRecords).values(
    servicoIds.map((servicoId) => ({
      barbeariaId: barbeiro.barbeariaId,
      clienteId,
      barbeiroId: barbeiro.id,
      servicoId,
      data: hojeISO,
    })),
  )

  await db
    .update(clientes)
    .set({
      loyaltyCortesAtual: sql`LEAST(${clientes.loyaltyCortesAtual} + 1, ${clientes.loyaltyCortesMeta})`,
    })
    .where(eq(clientes.id, clienteId))

  revalidatePath('/barbeiro/agenda')
  revalidatePath('/barbeiro/caixa')
  revalidatePath('/admin/agenda')
  revalidatePath('/admin/clientes')

  return { id: anchor.id }
}

export async function registrarMinhaVenda(
  produtoId: string,
  quantidade: number,
  clienteId?: string,
): Promise<Resultado> {
  const barbeiro = await assertBarbeiroLogado()
  if (quantidade <= 0) return { error: 'Quantidade inválida' }

  const db = getDb()

  const produto = (
    await db
      .select()
      .from(produtos)
      .where(and(eq(produtos.id, produtoId), eq(produtos.barbeariaId, barbeiro.barbeariaId)))
      .limit(1)
  )[0]
  if (!produto) return { error: 'Produto não encontrado' }

  const qtd = Math.min(quantidade, produto.estoque)
  if (qtd <= 0) return { error: 'Sem estoque disponível' }

  await db
    .update(produtos)
    .set({ estoque: sql`${produtos.estoque} - ${qtd}` })
    .where(and(eq(produtos.id, produtoId), gte(produtos.estoque, qtd)))

  await db.insert(vendas).values({
    barbeariaId: barbeiro.barbeariaId,
    produtoId,
    barbeiroId: barbeiro.id,
    clienteId: clienteId || null,
    quantidade: qtd,
    data: getHojeISO(),
    valorTotal: produto.precoVenda * qtd,
  })

  revalidatePath('/barbeiro/produtos')
  return {}
}
