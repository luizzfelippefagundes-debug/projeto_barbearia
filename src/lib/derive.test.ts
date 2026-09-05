import { describe, expect, it } from 'vitest'
import type { Agendamento, Assinatura, Barbeiro, Cliente, PlanoAssinatura, Servico } from '../types'
import {
  COMISSAO_AVULSO_PERCENT,
  COMISSAO_PLANO_PERCENT,
  getComissaoServicosBarbeiroNoMes,
  getComissaoTotalBarbeiro,
  getCortesNoMesPorBarbeiro,
  getFechamentoCaixa,
  getMRR,
  getProgressoClientesPlano,
} from './derive'

const MES = '2026-09'

const servicos: Servico[] = [
  { id: 'cabelo', nome: 'Cabelo', duracaoMin: 30, precoAvulso: 40, ativo: true },
  { id: 'barba', nome: 'Barba', duracaoMin: 20, precoAvulso: 30, ativo: true },
  { id: 'pezinho', nome: 'Pezinho', duracaoMin: 10, precoAvulso: 15, ativo: true },
  { id: 'sobrancelha', nome: 'Sobrancelha', duracaoMin: 10, precoAvulso: 10, ativo: true },
]

const planoCompleto: PlanoAssinatura = {
  id: 'plano129',
  nome: 'Cabelo, Barba e Pezinho',
  valorMensal: 129.9,
  ativo: true,
  servicosInclusos: [
    { servicoId: 'cabelo', nome: 'Cabelo', limiteMensal: null },
    { servicoId: 'barba', nome: 'Barba', limiteMensal: null },
    { servicoId: 'pezinho', nome: 'Pezinho', limiteMensal: null },
  ],
}

const planoComLimite: PlanoAssinatura = {
  id: 'planoVIP',
  nome: 'VIP',
  valorMensal: 229.9,
  ativo: true,
  servicosInclusos: [{ servicoId: 'sobrancelha', nome: 'Sobrancelha', limiteMensal: 1 }],
}

const barbeiroDono: Barbeiro = {
  id: 'dono1',
  nome: 'Dono',
  papel: 'dono',
  ativo: true,
  convitePendente: false,
  diasTrabalho: [1, 2, 3, 4, 5, 6],
  horaInicio: '09:00',
  horaFim: '18:45',
}

const barbeiroA: Barbeiro = {
  id: 'barbeiroA',
  nome: 'Barbeiro A',
  papel: 'barbeiro',
  ativo: true,
  convitePendente: false,
  diasTrabalho: [1, 2, 3, 4, 5, 6],
  horaInicio: '09:00',
  horaFim: '18:45',
}

const barbeiroB: Barbeiro = {
  id: 'barbeiroB',
  nome: 'Barbeiro B',
  papel: 'barbeiro',
  ativo: true,
  convitePendente: false,
  diasTrabalho: [1, 2, 3, 4, 5, 6],
  horaInicio: '09:00',
  horaFim: '18:45',
}

function cliente(id: string, historico: Cliente['historico'] = []): Cliente {
  return {
    id,
    nome: `Cliente ${id}`,
    telefone: '27999999999',
    tags: [],
    historico,
    loyaltyCortesAtual: 0,
    loyaltyCortesMeta: 10,
    canalIndicacao: 'outro',
    criadoEm: '2026-01-01',
  }
}

function agendamento(overrides: Partial<Agendamento> & Pick<Agendamento, 'id' | 'data' | 'hora' | 'barbeiroId' | 'servicoIds'>): Agendamento {
  return {
    clienteId: 'cliente1',
    status: 'atendido',
    ...overrides,
  }
}

function assinatura(overrides: Partial<Assinatura> & Pick<Assinatura, 'id' | 'clienteId' | 'planoId'>): Assinatura {
  return {
    status: 'em_dia',
    proximaCobranca: '2026-10-01',
    criadoEm: '2026-01-01',
    ...overrides,
  }
}

describe('contaComoAtendimento (via getCortesNoMesPorBarbeiro)', () => {
  it('conta "atendido" sempre', () => {
    const ags = [agendamento({ id: 'a1', data: '2026-09-10', hora: '10:00', barbeiroId: 'barbeiroA', servicoIds: ['cabelo'], status: 'atendido' })]
    expect(getCortesNoMesPorBarbeiro(ags, 'barbeiroA', MES)).toBe(1)
  })

  it('não conta "confirmado" cujo horário ainda não chegou (data futura)', () => {
    const ags = [agendamento({ id: 'a1', data: '2099-09-10', hora: '10:00', barbeiroId: 'barbeiroA', servicoIds: ['cabelo'], status: 'confirmado' })]
    expect(getCortesNoMesPorBarbeiro(ags, 'barbeiroA', '2099-09')).toBe(0)
  })

  it('conta "confirmado" cuja data já passou', () => {
    const ags = [agendamento({ id: 'a1', data: '2020-01-10', hora: '10:00', barbeiroId: 'barbeiroA', servicoIds: ['cabelo'], status: 'confirmado' })]
    expect(getCortesNoMesPorBarbeiro(ags, 'barbeiroA', '2020-01')).toBe(1)
  })

  it('nunca conta linha de continuação (mesmo visita, não visita nova)', () => {
    const ags = [
      agendamento({ id: 'a1', data: '2026-09-10', hora: '10:00', barbeiroId: 'barbeiroA', servicoIds: ['cabelo', 'barba'], status: 'atendido' }),
      agendamento({ id: 'a2', data: '2026-09-10', hora: '10:45', barbeiroId: 'barbeiroA', servicoIds: [], status: 'atendido', continuacaoDeId: 'a1' }),
    ]
    expect(getCortesNoMesPorBarbeiro(ags, 'barbeiroA', MES)).toBe(1)
  })
})

describe('comissão avulso — 50% por serviço, toda visita, sem teto', () => {
  it('rende 50% do preço cheio pra cliente sem plano', () => {
    const ags = [agendamento({ id: 'a1', data: '2026-09-10', hora: '10:00', barbeiroId: 'barbeiroA', servicoIds: ['cabelo'], clienteId: 'c1' })]
    const comissao = getComissaoServicosBarbeiroNoMes(ags, servicos, [cliente('c1')], [], [], [barbeiroA], 'barbeiroA', MES)
    expect(comissao).toBeCloseTo(40 * (COMISSAO_AVULSO_PERCENT / 100))
  })

  it('rende comissão de novo a cada visita avulsa (não é fixo por cliente)', () => {
    const ags = [
      agendamento({ id: 'a1', data: '2026-09-03', hora: '10:00', barbeiroId: 'barbeiroA', servicoIds: ['cabelo'], clienteId: 'c1' }),
      agendamento({ id: 'a2', data: '2026-09-20', hora: '10:00', barbeiroId: 'barbeiroA', servicoIds: ['cabelo'], clienteId: 'c1' }),
    ]
    const comissao = getComissaoServicosBarbeiroNoMes(ags, servicos, [cliente('c1')], [], [], [barbeiroA], 'barbeiroA', MES)
    expect(comissao).toBeCloseTo(2 * 40 * (COMISSAO_AVULSO_PERCENT / 100))
  })
})

describe('comissão de plano — valor fixo por cliente/mês, dono nunca disputa', () => {
  it('rende 45% da mensalidade uma única vez, pro barbeiro que atendeu', () => {
    const ags = [agendamento({ id: 'a1', data: '2026-09-05', hora: '10:00', barbeiroId: 'barbeiroA', servicoIds: ['cabelo', 'barba'], clienteId: 'c1' })]
    const assinaturas = [assinatura({ id: 's1', clienteId: 'c1', planoId: 'plano129' })]
    const comissao = getComissaoServicosBarbeiroNoMes(ags, servicos, [cliente('c1')], [planoCompleto], assinaturas, [barbeiroA], 'barbeiroA', MES)
    expect(comissao).toBeCloseTo(129.9 * (COMISSAO_PLANO_PERCENT / 100))
  })

  it('não rende de novo se o mesmo cliente voltar no mesmo mês (com o mesmo ou outro barbeiro)', () => {
    const ags = [
      agendamento({ id: 'a1', data: '2026-09-05', hora: '10:00', barbeiroId: 'barbeiroA', servicoIds: ['cabelo'], clienteId: 'c1' }),
      agendamento({ id: 'a2', data: '2026-09-20', hora: '10:00', barbeiroId: 'barbeiroB', servicoIds: ['barba'], clienteId: 'c1' }),
    ]
    const assinaturas = [assinatura({ id: 's1', clienteId: 'c1', planoId: 'plano129' })]
    const barbeiros = [barbeiroA, barbeiroB]
    const comissaoA = getComissaoServicosBarbeiroNoMes(ags, servicos, [cliente('c1')], [planoCompleto], assinaturas, barbeiros, 'barbeiroA', MES)
    const comissaoB = getComissaoServicosBarbeiroNoMes(ags, servicos, [cliente('c1')], [planoCompleto], assinaturas, barbeiros, 'barbeiroB', MES)
    expect(comissaoA).toBeCloseTo(129.9 * (COMISSAO_PLANO_PERCENT / 100))
    expect(comissaoB).toBe(0)
  })

  it('atendimento do dono não conta como ativador — o próximo barbeiro de verdade leva a comissão inteira', () => {
    const ags = [
      agendamento({ id: 'a1', data: '2026-09-03', hora: '10:00', barbeiroId: 'dono1', servicoIds: ['cabelo', 'barba'], clienteId: 'c1' }),
      agendamento({ id: 'a2', data: '2026-09-20', hora: '11:00', barbeiroId: 'barbeiroA', servicoIds: ['pezinho'], clienteId: 'c1' }),
    ]
    const assinaturas = [assinatura({ id: 's1', clienteId: 'c1', planoId: 'plano129' })]
    const barbeiros = [barbeiroDono, barbeiroA]
    const comissaoDono = getComissaoServicosBarbeiroNoMes(ags, servicos, [cliente('c1')], [planoCompleto], assinaturas, barbeiros, 'dono1', MES)
    const comissaoA = getComissaoServicosBarbeiroNoMes(ags, servicos, [cliente('c1')], [planoCompleto], assinaturas, barbeiros, 'barbeiroA', MES)
    expect(comissaoDono).toBe(0)
    expect(comissaoA).toBeCloseTo(129.9 * (COMISSAO_PLANO_PERCENT / 100))
  })

  it('se só o dono atender o cliente de plano no mês, ninguém recebe comissão de plano', () => {
    const ags = [agendamento({ id: 'a1', data: '2026-09-03', hora: '10:00', barbeiroId: 'dono1', servicoIds: ['cabelo'], clienteId: 'c1' })]
    const assinaturas = [assinatura({ id: 's1', clienteId: 'c1', planoId: 'plano129' })]
    const comissaoDono = getComissaoServicosBarbeiroNoMes(ags, servicos, [cliente('c1')], [planoCompleto], assinaturas, [barbeiroDono], 'dono1', MES)
    expect(comissaoDono).toBe(0)
  })

  it('serviço fora do plano, na mesma visita que ativa o plano, ainda rende 50% avulso', () => {
    const ags = [
      agendamento({ id: 'a1', data: '2026-09-05', hora: '10:00', barbeiroId: 'barbeiroA', servicoIds: ['cabelo', 'sobrancelha'], clienteId: 'c1' }),
    ]
    const assinaturas = [assinatura({ id: 's1', clienteId: 'c1', planoId: 'plano129' })]
    const comissao = getComissaoServicosBarbeiroNoMes(ags, servicos, [cliente('c1')], [planoCompleto], assinaturas, [barbeiroA], 'barbeiroA', MES)
    const esperado = 129.9 * (COMISSAO_PLANO_PERCENT / 100) + 10 * (COMISSAO_AVULSO_PERCENT / 100)
    expect(comissao).toBeCloseTo(esperado)
  })

  it('serviço do plano com limite mensal esgotado vira avulso (50%, não 45%)', () => {
    const historico = [{ id: 'h1', data: '2026-09-01', barbeiroId: 'barbeiroA', servicoId: 'sobrancelha' }]
    const ags = [
      agendamento({ id: 'a1', data: '2026-09-15', hora: '10:00', barbeiroId: 'barbeiroA', servicoIds: ['sobrancelha'], clienteId: 'c1' }),
    ]
    const assinaturas = [assinatura({ id: 's1', clienteId: 'c1', planoId: 'planoVIP' })]
    const comissao = getComissaoServicosBarbeiroNoMes(ags, servicos, [cliente('c1', historico)], [planoComLimite], assinaturas, [barbeiroA], 'barbeiroA', MES)
    // sobrancelha já foi usada 1x (limite é 1x/mês) -> essa 2ª vez conta como avulso
    expect(comissao).toBeCloseTo(10 * (COMISSAO_AVULSO_PERCENT / 100))
  })
})

describe('getProgressoClientesPlano', () => {
  it('mostra a comissão ganha por cada cliente de plano atendido pelo barbeiro', () => {
    const ags = [agendamento({ id: 'a1', data: '2026-09-05', hora: '10:00', barbeiroId: 'barbeiroA', servicoIds: ['cabelo'], clienteId: 'c1' })]
    const assinaturas = [assinatura({ id: 's1', clienteId: 'c1', planoId: 'plano129' })]
    const progresso = getProgressoClientesPlano(ags, servicos, [cliente('c1')], [planoCompleto], assinaturas, [barbeiroA], 'barbeiroA', MES)
    expect(progresso).toHaveLength(1)
    expect(progresso[0].comissaoGanha).toBeCloseTo(129.9 * (COMISSAO_PLANO_PERCENT / 100))
  })
})

describe('getComissaoTotalBarbeiro', () => {
  it('soma comissão de serviços + comissão de vendas de produto', () => {
    const ags = [agendamento({ id: 'a1', data: '2026-09-05', hora: '10:00', barbeiroId: 'barbeiroA', servicoIds: ['cabelo'], clienteId: 'c1' })]
    const total = getComissaoTotalBarbeiro(ags, servicos, [cliente('c1')], [], [], [barbeiroA], 'barbeiroA', MES, 100)
    const esperado = 40 * (COMISSAO_AVULSO_PERCENT / 100) + 100 * 0.1
    expect(total).toBeCloseTo(esperado)
  })
})

describe('getMRR — só conta assinatura realmente paga', () => {
  it('conta em_dia e atrasado', () => {
    const assinaturas = [
      assinatura({ id: 's1', clienteId: 'c1', planoId: 'plano129', status: 'em_dia' }),
      assinatura({ id: 's2', clienteId: 'c2', planoId: 'plano129', status: 'atrasado' }),
    ]
    expect(getMRR(assinaturas, [planoCompleto])).toBeCloseTo(2 * 129.9)
  })

  it('ignora "aguardando" (nunca confirmou pagamento) e "cancelado"', () => {
    const assinaturas = [
      assinatura({ id: 's1', clienteId: 'c1', planoId: 'plano129', status: 'aguardando' }),
      assinatura({ id: 's2', clienteId: 'c2', planoId: 'plano129', status: 'cancelado' }),
    ]
    expect(getMRR(assinaturas, [planoCompleto])).toBe(0)
  })
})

describe('getFechamentoCaixa — avulso não conta serviço já coberto por plano', () => {
  it('serviço coberto pelo plano entra como R$0 no avulso (já foi pago na mensalidade)', () => {
    const ags = [agendamento({ id: 'a1', data: '2026-09-05', hora: '10:00', barbeiroId: 'barbeiroA', servicoIds: ['cabelo'], clienteId: 'c1' })]
    const assinaturas = [assinatura({ id: 's1', clienteId: 'c1', planoId: 'plano129' })]
    const fechamento = getFechamentoCaixa(ags, servicos, [], assinaturas, [planoCompleto], [cliente('c1')], MES)
    expect(fechamento.avulso).toBe(0)
  })

  it('serviço fora do plano entra com preço cheio no avulso', () => {
    const ags = [agendamento({ id: 'a1', data: '2026-09-05', hora: '10:00', barbeiroId: 'barbeiroA', servicoIds: ['cabelo'], clienteId: 'c1' })]
    const fechamento = getFechamentoCaixa(ags, servicos, [], [], [], [cliente('c1')], MES)
    expect(fechamento.avulso).toBe(40)
  })
})
