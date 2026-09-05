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
  'atendido',
  'livre',
  'aguardando',
  'bloqueado',
  'nao_compareceu',
])

export const statusPagamentoEnum = pgEnum('status_pagamento', [
  'em_dia',
  'atrasado',
  'aguardando',
  'cancelado',
])

export const statusPayoutEnum = pgEnum('status_payout', ['transferido', 'pendente'])

/** Forma de pagamento de um corte avulso — só pra organização/relatório
 * (não muda comissão nem fechamento de caixa), preenchido quando o
 * atendimento tem alguma parte paga na hora (fora do plano). */
export const formaPagamentoEnum = pgEnum('forma_pagamento', ['pix', 'cartao', 'dinheiro'])

export const canalIndicacaoEnum = pgEnum('canal_indicacao', [
  'indicacao_amigo',
  'instagram',
  'google',
  'passou_na_rua',
  'outro',
])

export const avaliacaoEnum = pgEnum('avaliacao', ['up', 'down'])

export const papelBarbeiroEnum = pgEnum('papel_barbeiro', ['dono', 'barbeiro'])

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
  /** E-mail informado pelo dono ao cadastrar o barbeiro — usado só para
   * ligar a conta do Clerk automaticamente no primeiro login dele
   * (comparado com o e-mail da conta, não é um campo de contato). */
  emailConvite: text('email_convite'),
  nome: text('nome').notNull(),
  /** Telefone de contato dele mesmo — usado pelo bot do WhatsApp pra
   * reconhecer que quem tá mandando mensagem é da equipe, não cliente. */
  telefone: text('telefone'),
  avatarUrl: text('avatar_url'),
  papel: papelBarbeiroEnum('papel').notNull().default('barbeiro'),
  ativo: boolean('ativo').notNull().default(true),
  /** Dias da semana que ele trabalha (0=domingo..6=sábado, mesma convenção
   * de Date.getDay()) — só filtra o que aparece pro CLIENTE agendar; a
   * agenda do dono/barbeiro continua livre pra marcar/bloquear qualquer
   * horário manualmente. */
  diasTrabalho: integer('dias_trabalho').array().notNull().default([0, 1, 2, 3, 4, 5, 6]),
  horaInicio: text('hora_inicio').notNull().default('09:00'),
  horaFim: text('hora_fim').notNull().default('18:45'),
  /** Meta pessoal de comissão do mês — só o próprio barbeiro define e vê,
   * não é meta de faturamento da loja (essa já existe em `configuracoes`). */
  metaComissaoMensal: money('meta_comissao_mensal'),
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
  /** Só afeta a lista de planos pra assinar (novo cliente). Assinaturas já
   * existentes continuam funcionando mesmo se o plano ficar inativo. */
  ativo: boolean('ativo').notNull().default(true),
  criadoEm: timestamp('criado_em').notNull().defaultNow(),
})

/** Quais serviços cada plano cobre e com que limite mensal (null = sem
 * limite dentro do plano — ex: cabelo/barba/pezinho ilimitados, mas
 * barboterapia do VIP só 4x/mês). */
export const planoServicosInclusos = pgTable(
  'plano_servicos_inclusos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    planoId: uuid('plano_id')
      .notNull()
      .references(() => planosAssinatura.id, { onDelete: 'cascade' }),
    servicoId: uuid('servico_id')
      .notNull()
      .references(() => servicos.id, { onDelete: 'cascade' }),
    limiteMensal: integer('limite_mensal'),
  },
  (table) => [unique('plano_servico_unico').on(table.planoId, table.servicoId)],
)

export const clientes = pgTable('clientes', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkUserId: text('clerk_user_id').unique(),
  nome: text('nome').notNull(),
  telefone: text('telefone').notNull(),
  /** Só dígitos. Exigido pelo Asaas pra criar o cliente lá — preenchido na
   * primeira vez que essa pessoa assina um plano. */
  cpfCnpj: text('cpf_cnpj'),
  asaasCustomerId: text('asaas_customer_id').unique(),
  avatarUrl: text('avatar_url'),
  tags: text('tags').array().notNull().default([]),
  loyaltyCortesAtual: integer('loyalty_cortes_atual').notNull().default(0),
  loyaltyCortesMeta: integer('loyalty_cortes_meta').notNull().default(10),
  canalIndicacao: canalIndicacaoEnum('canal_indicacao').notNull().default('outro'),
  indicadoPor: uuid('indicado_por').references((): AnyPgColumn => clientes.id, {
    onDelete: 'set null',
  }),
  /** Código curto e único usado no link "indique um amigo" (ex: /r/AB3XQ9). */
  codigoIndicacao: text('codigo_indicacao').unique(),
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
  asaasSubscriptionId: text('asaas_subscription_id').unique(),
  /** Id da primeira cobrança gerada pela assinatura no Asaas — permite
   * reabrir o QR Code PIX sem precisar re-listar cobranças. */
  asaasFirstPaymentId: text('asaas_first_payment_id'),
  criadoEm: timestamp('criado_em').notNull().defaultNow(),
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
    status: statusAgendamentoEnum('status').notNull().default('livre'),
    /** Quando um agendamento pede serviços cuja duração soma mais que um
     * slot, os slots seguintes viram linhas "continuação" apontando pra cá
     * — existem só pra travar o horário na agenda, não têm serviço/cliente
     * próprio (usam o mesmo cliente do agendamento original pra exibição). */
    continuacaoDeId: uuid('continuacao_de_id').references((): AnyPgColumn => agendamentos.id, {
      onDelete: 'cascade',
    }),
    /** Controle do bot de lembrete no WhatsApp — evita mandar a mesma
     * mensagem duas vezes pro cliente. */
    lembreteVesperaEnviado: boolean('lembrete_vespera_enviado').notNull().default(false),
    lembrete1hEnviado: boolean('lembrete_1h_enviado').notNull().default(false),
    /** Controle do bot: já avisou o barbeiro no WhatsApp que esse horário
     * foi marcado? Evita avisar de novo a cada checagem periódica. */
    barbeiroAvisadoNovoAgendamento: boolean('barbeiro_avisado_novo_agendamento').notNull().default(false),
    /** Só preenchido quando o atendimento tem parte avulsa (fora do plano)
     * — organização/relatório, não afeta comissão nem fechamento de caixa. */
    formaPagamento: formaPagamentoEnum('forma_pagamento'),
    /** Qual barbeiro/dono ficou com o dinheiro na hora — referência direta
     * (não enum fixo), porque pode ter mais de um "dono" na barbearia. */
    caixaDestinoBarbeiroId: uuid('caixa_destino_barbeiro_id').references(() => barbeiros.id, {
      onDelete: 'set null',
    }),
    criadoEm: timestamp('criado_em').notNull().defaultNow(),
  },
  (table) => [unique('agendamentos_slot_unico').on(table.data, table.hora, table.barbeiroId)],
)

/** Um agendamento pode ter mais de um serviço (ex: corte + barba no mesmo
 * horário) — cada linha aqui é um serviço pedido naquele agendamento. */
export const agendamentoServicos = pgTable('agendamento_servicos', {
  id: uuid('id').primaryKey().defaultRandom(),
  agendamentoId: uuid('agendamento_id')
    .notNull()
    .references(() => agendamentos.id, { onDelete: 'cascade' }),
  servicoId: uuid('servico_id')
    .notNull()
    .references(() => servicos.id, { onDelete: 'cascade' }),
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

/** Linha única de configurações do negócio (id fixo 'default') — hoje só
 * guarda a meta de faturamento mensal usada em Financeiro. */
export const configuracoes = pgTable('configuracoes', {
  id: text('id').primaryKey().default('default'),
  metaFaturamentoMensal: money('meta_faturamento_mensal'),
})

/** Registro de cada notificação de webhook do Asaas já processada — evita
 * reprocessar a mesma cobrança duas vezes se o Asaas reenviar a notificação. */
export const asaasWebhookEventos = pgTable('asaas_webhook_eventos', {
  id: uuid('id').primaryKey().defaultRandom(),
  asaasEventId: text('asaas_event_id').notNull().unique(),
  evento: text('evento').notNull(),
  paymentId: text('payment_id'),
  recebidoEm: timestamp('recebido_em').notNull().defaultNow(),
})

/** Uma linha por dia fechado — trava os números do fechamento de caixa
 * daquele dia em vez de deixar só um total calculado ao vivo. */
export const fechamentosCaixa = pgTable('fechamentos_caixa', {
  id: uuid('id').primaryKey().defaultRandom(),
  data: date('data').notNull().unique(),
  avulso: money('avulso').notNull(),
  assinatura: money('assinatura').notNull(),
  produtos: money('produtos').notNull(),
  total: money('total').notNull(),
  fechadoEm: timestamp('fechado_em').notNull().defaultNow(),
  fechadoPorBarbeiroId: uuid('fechado_por_barbeiro_id').references(() => barbeiros.id, {
    onDelete: 'set null',
  }),
})

/** Fila de avisos pro bot do WhatsApp mandar pro barbeiro — usada quando
 * algo acontece PELO SITE (não pelo bot), já que o bot roda numa rede
 * separada (VPS) e não fica sabendo na hora. O bot (projeto separado)
 * verifica essa fila periodicamente e apaga a linha depois de mandar. */
export const avisosBarbeiro = pgTable('avisos_barbeiro', {
  id: uuid('id').primaryKey().defaultRandom(),
  barbeiroTelefone: text('barbeiro_telefone').notNull(),
  mensagem: text('mensagem').notNull(),
  criadoEm: timestamp('criado_em').notNull().defaultNow(),
})
