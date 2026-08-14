import {
  boolean,
  date,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  unique,
  uuid,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core'

export const statusAgendamentoEnum = pgEnum('status_agendamento', [
  'confirmado',
  'livre',
  'aguardando',
  'bloqueado',
])

export const statusPagamentoEnum = pgEnum('status_pagamento', [
  'em_dia',
  'atrasado',
  'aguardando',
  'cancelado',
])

export const statusPayoutEnum = pgEnum('status_payout', ['transferido', 'pendente'])

export const canalIndicacaoEnum = pgEnum('canal_indicacao', [
  'indicacao_amigo',
  'instagram',
  'google',
  'passou_na_rua',
  'outro',
])

export const avaliacaoEnum = pgEnum('avaliacao', ['up', 'down'])

const money = (col: string) => numeric(col, { precision: 10, scale: 2, mode: 'number' })

export const servicos = pgTable('servicos', {
  id: uuid('id').primaryKey().defaultRandom(),
  nome: text('nome').notNull(),
  duracaoMin: integer('duracao_min').notNull(),
  precoAvulso: money('preco_avulso').notNull(),
  ativo: boolean('ativo').notNull().default(true),
  criadoEm: timestamp('criado_em').notNull().defaultNow(),
})

export const produtos = pgTable('produtos', {
  id: uuid('id').primaryKey().defaultRandom(),
  nome: text('nome').notNull(),
  precoVenda: money('preco_venda').notNull(),
  estoque: integer('estoque').notNull().default(0),
  estoqueMinimo: integer('estoque_minimo').notNull().default(0),
  categoria: text('categoria').notNull(),
  ativo: boolean('ativo').notNull().default(true),
  criadoEm: timestamp('criado_em').notNull().defaultNow(),
})

export const barbeiros = pgTable('barbeiros', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkUserId: text('clerk_user_id').unique(),
  nome: text('nome').notNull(),
  avatarUrl: text('avatar_url'),
  comissaoPercent: integer('comissao_percent').notNull().default(40),
  ativo: boolean('ativo').notNull().default(true),
  criadoEm: timestamp('criado_em').notNull().defaultNow(),
})

export const payoutsBarbeiros = pgTable('payouts_barbeiros', {
  id: uuid('id').primaryKey().defaultRandom(),
  barbeiroId: uuid('barbeiro_id')
    .notNull()
    .references(() => barbeiros.id, { onDelete: 'cascade' }),
  mesReferencia: text('mes_referencia').notNull(),
  valor: money('valor').notNull(),
  status: statusPayoutEnum('status').notNull().default('pendente'),
  dataTransferencia: date('data_transferencia'),
})

export const planosAssinatura = pgTable('planos_assinatura', {
  id: uuid('id').primaryKey().defaultRandom(),
  nome: text('nome').notNull(),
  valorMensal: money('valor_mensal').notNull(),
  cortesInclusos: integer('cortes_inclusos'),
  criadoEm: timestamp('criado_em').notNull().defaultNow(),
})

export const clientes = pgTable('clientes', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkUserId: text('clerk_user_id').unique(),
  nome: text('nome').notNull(),
  telefone: text('telefone').notNull(),
  avatarUrl: text('avatar_url'),
  tags: text('tags').array().notNull().default([]),
  loyaltyCortesAtual: integer('loyalty_cortes_atual').notNull().default(0),
  loyaltyCortesMeta: integer('loyalty_cortes_meta').notNull().default(10),
  canalIndicacao: canalIndicacaoEnum('canal_indicacao').notNull().default('outro'),
  indicadoPor: uuid('indicado_por').references((): AnyPgColumn => clientes.id, {
    onDelete: 'set null',
  }),
  assinaturaId: uuid('assinatura_id'),
  criadoEm: timestamp('criado_em').notNull().defaultNow(),
})

export const assinaturas = pgTable('assinaturas', {
  id: uuid('id').primaryKey().defaultRandom(),
  clienteId: uuid('cliente_id')
    .notNull()
    .references(() => clientes.id, { onDelete: 'cascade' }),
  planoId: uuid('plano_id')
    .notNull()
    .references(() => planosAssinatura.id, { onDelete: 'restrict' }),
  status: statusPagamentoEnum('status').notNull().default('em_dia'),
  proximaCobranca: date('proxima_cobranca').notNull(),
  cartaoRecusado: boolean('cartao_recusado').notNull().default(false),
  ultimoReenvioEm: timestamp('ultimo_reenvio_em'),
})

export const agendamentos = pgTable(
  'agendamentos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    data: date('data').notNull(),
    hora: time('hora').notNull(),
    clienteId: uuid('cliente_id').references(() => clientes.id, { onDelete: 'set null' }),
    barbeiroId: uuid('barbeiro_id')
      .notNull()
      .references(() => barbeiros.id, { onDelete: 'cascade' }),
    servicoId: uuid('servico_id').references(() => servicos.id, { onDelete: 'set null' }),
    status: statusAgendamentoEnum('status').notNull().default('livre'),
    criadoEm: timestamp('criado_em').notNull().defaultNow(),
  },
  (table) => [unique('agendamentos_slot_unico').on(table.data, table.hora, table.barbeiroId)],
)

export const filaEspera = pgTable('fila_espera', {
  id: uuid('id').primaryKey().defaultRandom(),
  clienteId: uuid('cliente_id')
    .notNull()
    .references(() => clientes.id, { onDelete: 'cascade' }),
  desejaBarbeiroId: uuid('deseja_barbeiro_id').references(() => barbeiros.id, {
    onDelete: 'set null',
  }),
  desejaServicoId: uuid('deseja_servico_id').references(() => servicos.id, {
    onDelete: 'set null',
  }),
  criadoEm: timestamp('criado_em').notNull().defaultNow(),
  notificado: boolean('notificado').notNull().default(false),
})

export const haircutRecords = pgTable('haircut_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  clienteId: uuid('cliente_id')
    .notNull()
    .references(() => clientes.id, { onDelete: 'cascade' }),
  data: date('data').notNull(),
  barbeiroId: uuid('barbeiro_id')
    .notNull()
    .references(() => barbeiros.id, { onDelete: 'cascade' }),
  servicoId: uuid('servico_id')
    .notNull()
    .references(() => servicos.id, { onDelete: 'restrict' }),
  fotoUrl: text('foto_url'),
  notas: text('notas'),
  avaliacao: avaliacaoEnum('avaliacao'),
})

export const vendas = pgTable('vendas', {
  id: uuid('id').primaryKey().defaultRandom(),
  produtoId: uuid('produto_id')
    .notNull()
    .references(() => produtos.id, { onDelete: 'restrict' }),
  barbeiroId: uuid('barbeiro_id')
    .notNull()
    .references(() => barbeiros.id, { onDelete: 'cascade' }),
  clienteId: uuid('cliente_id').references(() => clientes.id, { onDelete: 'set null' }),
  quantidade: integer('quantidade').notNull(),
  data: date('data').notNull(),
  valorTotal: money('valor_total').notNull(),
})
