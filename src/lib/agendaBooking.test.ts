import { eq, and } from 'drizzle-orm'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getDb } from '../db'
import { agendamentoServicos, agendamentos, barbearias, barbeiros, clientes, servicos } from '../db/schema'
import { criarAgendamentoComServicos } from './agendaBooking'

// IDs criados no beforeAll — únicos por execução para não colidir com dados reais
let barbeariaId: string
let barbeiroId: string
let clienteId: string
let servicoCurtaId: string  // 30min
let servicoLongaId: string  // 50min (junto com curta = 80min → 2 slots)

const DATA_TESTE = '2099-01-15' // data no futuro pra não colidir com agendamentos reais

beforeAll(async () => {
  const db = getDb()

  const [barbearia] = await db
    .insert(barbearias)
    .values({ nome: 'Barbearia Teste Vitest', slug: `vitest-${Date.now()}` })
    .returning()
  barbeariaId = barbearia.id

  const [barbeiro] = await db
    .insert(barbeiros)
    .values({ barbeariaId, nome: 'Barbeiro Teste' })
    .returning()
  barbeiroId = barbeiro.id

  const [cliente] = await db
    .insert(clientes)
    .values({ barbeariaId, nome: 'Cliente Teste', telefone: '11999999999' })
    .returning()
  clienteId = cliente.id

  const [svcCurta] = await db
    .insert(servicos)
    .values({ barbeariaId, nome: 'Corte Rápido', duracaoMin: 30, precoAvulso: 40 })
    .returning()
  servicoCurtaId = svcCurta.id

  const [svcLonga] = await db
    .insert(servicos)
    .values({ barbeariaId, nome: 'Corte + Barba', duracaoMin: 50, precoAvulso: 70 })
    .returning()
  servicoLongaId = svcLonga.id
})

afterAll(async () => {
  // Deletar a barbearia cascateia tudo: barbeiros, clientes, servicos, agendamentos
  await getDb().delete(barbearias).where(eq(barbearias.id, barbeariaId))
})

describe('criarAgendamentoComServicos', () => {
  it('cria agendamento simples com 1 serviço de 30min → 1 slot na agenda', async () => {
    const anchor = await criarAgendamentoComServicos({
      data: DATA_TESTE,
      hora: '09:00',
      barbeiroId,
      clienteId,
      servicoIds: [servicoCurtaId],
      barbeariaId,
    })

    expect(anchor).toHaveProperty('id')

    const db = getDb()
    const slots = await db
      .select()
      .from(agendamentos)
      .where(and(eq(agendamentos.barbeiroId, barbeiroId), eq(agendamentos.data, DATA_TESTE), eq(agendamentos.hora, '09:00:00')))

    expect(slots).toHaveLength(1)
    expect(slots[0].clienteId).toBe(clienteId)
    expect(slots[0].continuacaoDeId).toBeNull()

    const svcs = await db.select().from(agendamentoServicos).where(eq(agendamentoServicos.agendamentoId, anchor.id))
    expect(svcs).toHaveLength(1)

    // limpeza pra não afetar os próximos testes
    await db.delete(agendamentos).where(eq(agendamentos.id, anchor.id))
  })

  it('serviço de 50min (50+5=55 > 45min de gap) ocupa 2 slots — âncora + continuação', async () => {
    const anchor = await criarAgendamentoComServicos({
      data: DATA_TESTE,
      hora: '10:30',
      barbeiroId,
      clienteId,
      servicoIds: [servicoLongaId],
      barbeariaId,
    })

    const db = getDb()
    const todos = await db
      .select()
      .from(agendamentos)
      .where(and(eq(agendamentos.barbeiroId, barbeiroId), eq(agendamentos.data, DATA_TESTE)))

    const anchorRow = todos.find((r) => r.id === anchor.id)
    const continuacaoRow = todos.find((r) => r.continuacaoDeId === anchor.id)

    expect(anchorRow).toBeDefined()
    expect(anchorRow?.hora).toBe('10:30:00')

    expect(continuacaoRow).toBeDefined()
    expect(continuacaoRow?.hora).toBe('11:15:00')
    expect(continuacaoRow?.clienteId).toBe(clienteId)

    await db.delete(agendamentos).where(eq(agendamentos.id, anchor.id))
  })

  it('lança erro ao tentar reservar slot já confirmado por outro cliente', async () => {
    const db = getDb()

    // Insere um agendamento já confirmado no slot 14:15
    const [ocupado] = await db
      .insert(agendamentos)
      .values({ data: DATA_TESTE, hora: '14:15', barbeiroId, clienteId, status: 'confirmado', barbeariaId })
      .returning()

    await expect(
      criarAgendamentoComServicos({
        data: DATA_TESTE,
        hora: '14:15',
        barbeiroId,
        clienteId,
        servicoIds: [servicoCurtaId],
        barbeariaId,
      }),
    ).rejects.toThrow('Esse horário não está mais disponível')

    await db.delete(agendamentos).where(eq(agendamentos.id, ocupado.id))
  })

  it('lança erro quando slot seguinte (continuação) está ocupado', async () => {
    const db = getDb()

    // Slot 15:45 está livre, mas 16:30 (o próximo) está confirmado —
    // o serviço de 50min precisaria de 15:45 + 16:30, mas 16:30 está tomado
    const [bloqueio] = await db
      .insert(agendamentos)
      .values({ data: DATA_TESTE, hora: '16:30', barbeiroId, clienteId, status: 'confirmado', barbeariaId })
      .returning()

    await expect(
      criarAgendamentoComServicos({
        data: DATA_TESTE,
        hora: '15:45',
        barbeiroId,
        clienteId,
        servicoIds: [servicoLongaId],
        barbeariaId,
      }),
    ).rejects.toThrow('Esses serviços não cabem nesse horário porque o próximo já está ocupado')

    await db.delete(agendamentos).where(eq(agendamentos.id, bloqueio.id))
  })

  it('slot com status "livre" pode ser substituído (upsert do agendamento)', async () => {
    const db = getDb()

    // Slot 13:30 existe mas está "livre" — deve ser reutilizado pelo upsert
    const [livre] = await db
      .insert(agendamentos)
      .values({ data: DATA_TESTE, hora: '13:30', barbeiroId, status: 'livre', barbeariaId })
      .returning()

    const anchor = await criarAgendamentoComServicos({
      data: DATA_TESTE,
      hora: '13:30',
      barbeiroId,
      clienteId,
      servicoIds: [servicoCurtaId],
      barbeariaId,
    })

    // O id do upsert deve ser o mesmo row que estava livre
    expect(anchor.id).toBe(livre.id)

    const [atualizado] = await db
      .select()
      .from(agendamentos)
      .where(eq(agendamentos.id, anchor.id))

    expect(atualizado.status).toBe('confirmado')
    expect(atualizado.clienteId).toBe(clienteId)

    await db.delete(agendamentos).where(eq(agendamentos.id, anchor.id))
  })

  it('lança erro ao tentar criar agendamento sem serviços', async () => {
    await expect(
      criarAgendamentoComServicos({
        data: DATA_TESTE,
        hora: '09:00',
        barbeiroId,
        clienteId,
        servicoIds: [],
        barbeariaId,
      }),
    ).rejects.toThrow('Escolha pelo menos um serviço.')
  })
})
