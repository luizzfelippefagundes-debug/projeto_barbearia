import type {
  Agendamento,
  Assinatura,
  Barbeiro,
  Cliente,
  PlanoAssinatura,
  Produto,
  Servico,
  Venda,
} from '../types'

function mesReferenciaDeData(dataISO: string): string {
  return dataISO.slice(0, 7)
}

/** 'confirmado' = marcado, ainda vai acontecer; 'atendido' = o barbeiro já
 * registrou que rolou de verdade. Pra fins de faturamento/comissão/contagem,
 * as duas contam como um corte real — só muda se já foi registrado ou não. */
function contaComoAtendimento(status: string): boolean {
  return status === 'confirmado' || status === 'atendido'
}

function precoServico(servicos: Servico[], servicoId: string | undefined): number {
  return servicos.find((s) => s.id === servicoId)?.precoAvulso ?? 0
}

/** Preço que o cliente paga por um serviço — grátis se coberto pela assinatura
 * (sem limite mensal), 10% off nos demais serviços pra quem é assinante em dia. */
export function getPrecoServicoParaCliente(
  servico: Servico,
  assinanteAtivo: boolean,
): { valor: number; incluido: boolean } {
  if (servico.incluidoNoPlano && assinanteAtivo) return { valor: 0, incluido: true }
  if (assinanteAtivo) return { valor: Math.round(servico.precoAvulso * 0.9 * 100) / 100, incluido: false }
  return { valor: servico.precoAvulso, incluido: false }
}

function clientesComAssinaturaAtiva(assinaturas: Assinatura[]): Set<string> {
  return new Set(assinaturas.filter((a) => a.status === 'em_dia').map((a) => a.clienteId))
}

function precoRealAgendamento(
  servicos: Servico[],
  assinantesAtivos: Set<string>,
  agendamento: Agendamento,
): number {
  const servico = servicos.find((s) => s.id === agendamento.servicoId)
  if (!servico) return 0
  const ehAssinante = Boolean(agendamento.clienteId && assinantesAtivos.has(agendamento.clienteId))
  return getPrecoServicoParaCliente(servico, ehAssinante).valor
}

export function getCortesNoMesPorBarbeiro(
  agendamentos: Agendamento[],
  barbeiroId: string,
  mesReferencia: string,
): number {
  return agendamentos.filter(
    (a) =>
      a.barbeiroId === barbeiroId &&
      contaComoAtendimento(a.status) &&
      mesReferenciaDeData(a.data) === mesReferencia,
  ).length
}

export function getFaturamentoGeradoPorBarbeiroNoMes(
  agendamentos: Agendamento[],
  servicos: Servico[],
  barbeiroId: string,
  mesReferencia: string,
): number {
  return agendamentos
    .filter(
      (a) =>
        a.barbeiroId === barbeiroId &&
        contaComoAtendimento(a.status) &&
        mesReferenciaDeData(a.data) === mesReferencia,
    )
    .reduce((total, a) => total + precoServico(servicos, a.servicoId), 0)
}

export function getValorAReceber(barbeiro: Barbeiro, faturamentoGerado: number): number {
  return Math.round(faturamentoGerado * (barbeiro.comissaoPercent / 100) * 100) / 100
}

/** Comissão sobre venda de produto é fixa pra todo barbeiro — diferente da
 * comissão de serviço, que é configurável por barbeiro (comissaoPercent). */
export const COMISSAO_VENDA_PRODUTO_PERCENT = 10

export function getVendasDoBarbeiroNoMes(vendas: Venda[], barbeiroId: string, mesReferencia: string): number {
  return vendas
    .filter((v) => v.barbeiroId === barbeiroId && mesReferenciaDeData(v.data) === mesReferencia)
    .reduce((total, v) => total + v.valorTotal, 0)
}

export function getComissaoVendasProdutos(totalVendas: number): number {
  return Math.round(totalVendas * (COMISSAO_VENDA_PRODUTO_PERCENT / 100) * 100) / 100
}

/** Valor total a receber do barbeiro no mês: comissão de serviços (taxa
 * própria do barbeiro) + comissão de vendas de produto (taxa fixa de 10%). */
export function getComissaoTotalBarbeiro(
  barbeiro: Barbeiro,
  faturamentoServicos: number,
  totalVendasProdutos: number,
): number {
  return (
    Math.round(
      (getValorAReceber(barbeiro, faturamentoServicos) + getComissaoVendasProdutos(totalVendasProdutos)) * 100,
    ) / 100
  )
}

export function getRankingBarbeiros(
  barbeiros: Barbeiro[],
  agendamentos: Agendamento[],
  servicos: Servico[],
  mesReferencia: string,
) {
  return barbeiros
    .map((barbeiro) => {
      const cortes = getCortesNoMesPorBarbeiro(agendamentos, barbeiro.id, mesReferencia)
      const faturamento = getFaturamentoGeradoPorBarbeiroNoMes(
        agendamentos,
        servicos,
        barbeiro.id,
        mesReferencia,
      )
      return { barbeiro, cortes, faturamento }
    })
    .sort((a, b) => b.faturamento - a.faturamento)
}

export function getMRR(assinaturas: Assinatura[], planos: PlanoAssinatura[]): number {
  return assinaturas
    .filter((a) => a.status !== 'cancelado')
    .reduce((total, a) => {
      const plano = planos.find((p) => p.id === a.planoId)
      return total + (plano?.valorMensal ?? 0)
    }, 0)
}

export function getAssinantesEmDia(assinaturas: Assinatura[]): number {
  return assinaturas.filter((a) => a.status === 'em_dia').length
}

export function getTicketMedio(
  agendamentos: Agendamento[],
  servicos: Servico[],
  mesReferencia: string,
): number {
  const confirmados = agendamentos.filter(
    (a) => contaComoAtendimento(a.status) && mesReferenciaDeData(a.data) === mesReferencia,
  )
  if (confirmados.length === 0) return 0
  const total = confirmados.reduce((sum, a) => sum + precoServico(servicos, a.servicoId), 0)
  return Math.round((total / confirmados.length) * 100) / 100
}

export function getFrequenciaRetornoDias(cliente: Cliente): number | null {
  if (cliente.historico.length < 2) return null
  const datas = [...cliente.historico]
    .map((h) => new Date(h.data).getTime())
    .sort((a, b) => a - b)
  const intervalos = datas.slice(1).map((d, i) => (d - datas[i]) / (1000 * 60 * 60 * 24))
  const media = intervalos.reduce((a, b) => a + b, 0) / intervalos.length
  return Math.round(media)
}

export function getClientesSumindo(
  clientes: Cliente[],
  hojeISO: string,
  thresholdDias: number,
): Array<{ cliente: Cliente; diasSemVisita: number }> {
  const hoje = new Date(hojeISO).getTime()
  return clientes
    .filter((c) => c.historico.length > 0)
    .map((c) => {
      const ultimaVisita = c.historico.reduce(
        (mais, h) => (new Date(h.data).getTime() > mais ? new Date(h.data).getTime() : mais),
        0,
      )
      const diasSemVisita = Math.round((hoje - ultimaVisita) / (1000 * 60 * 60 * 24))
      return { cliente: c, diasSemVisita }
    })
    .filter((entry) => entry.diasSemVisita >= thresholdDias)
    .sort((a, b) => b.diasSemVisita - a.diasSemVisita)
}

export function getBestSellerPorBarbeiro(
  vendas: Venda[],
  produtos: Produto[],
  barbeiroId: string,
): { produto: Produto; quantidade: number } | null {
  const totals = new Map<string, number>()
  vendas
    .filter((v) => v.barbeiroId === barbeiroId)
    .forEach((v) => totals.set(v.produtoId, (totals.get(v.produtoId) ?? 0) + v.quantidade))

  let melhorId: string | null = null
  let melhorQtd = 0
  totals.forEach((qtd, produtoId) => {
    if (qtd > melhorQtd) {
      melhorQtd = qtd
      melhorId = produtoId
    }
  })
  if (!melhorId) return null
  const produto = produtos.find((p) => p.id === melhorId)
  if (!produto) return null
  return { produto, quantidade: melhorQtd }
}

export function getFechamentoCaixa(
  agendamentos: Agendamento[],
  servicos: Servico[],
  vendas: Venda[],
  assinaturas: Assinatura[],
  planos: PlanoAssinatura[],
  clientes: Cliente[],
  mesReferencia: string,
) {
  const assinantesAtivos = clientesComAssinaturaAtiva(assinaturas)

  const avulso = agendamentos
    .filter((a) => contaComoAtendimento(a.status) && mesReferenciaDeData(a.data) === mesReferencia)
    .reduce((sum, a) => sum + precoRealAgendamento(servicos, assinantesAtivos, a), 0)

  const produtos = vendas
    .filter((v) => mesReferenciaDeData(v.data) === mesReferencia)
    .reduce((sum, v) => sum + v.valorTotal, 0)

  const assinaturaTotal = getMRR(assinaturas, planos)

  return {
    avulso,
    produtos,
    assinatura: assinaturaTotal,
    total: avulso + produtos + assinaturaTotal,
  }
}

/** Fechamento de caixa de um dia específico — diferente de getFechamentoCaixa
 * (que soma o MRR do mês inteiro pra "assinatura"), aqui "assinatura" é o
 * valor das cobranças recorrentes que caem NAQUELE dia (proximaCobranca),
 * já que é isso que efetivamente "entra no caixa" no dia. */
export function getFechamentoCaixaDoDia(
  agendamentos: Agendamento[],
  servicos: Servico[],
  vendas: Venda[],
  assinaturas: Assinatura[],
  planos: PlanoAssinatura[],
  clientes: Cliente[],
  dataISO: string,
) {
  const assinantesAtivos = clientesComAssinaturaAtiva(assinaturas)

  const avulso = agendamentos
    .filter((a) => contaComoAtendimento(a.status) && a.data === dataISO)
    .reduce((sum, a) => sum + precoRealAgendamento(servicos, assinantesAtivos, a), 0)

  const produtos = vendas
    .filter((v) => v.data === dataISO)
    .reduce((sum, v) => sum + v.valorTotal, 0)

  const assinatura = assinaturas
    .filter((a) => a.status !== 'cancelado' && a.proximaCobranca === dataISO)
    .reduce((sum, a) => {
      const plano = planos.find((p) => p.id === a.planoId)
      return sum + (plano?.valorMensal ?? 0)
    }, 0)

  return {
    avulso,
    produtos,
    assinatura,
    total: avulso + produtos + assinatura,
  }
}

/** Faturamento acumulado real (avulso + produtos) dia a dia, só até hoje —
 * sem projetar os dias que ainda não aconteceram. */
export function getFaturamentoAcumuladoPorDia(
  agendamentos: Agendamento[],
  servicos: Servico[],
  vendas: Venda[],
  mesReferencia: string,
  hojeISO: string,
): Array<{ dia: number; valor: number }> {
  const ultimoDia = hojeISO.startsWith(mesReferencia) ? Number(hojeISO.slice(8, 10)) : 1

  const porDia = new Map<number, number>()
  agendamentos
    .filter((a) => contaComoAtendimento(a.status) && mesReferenciaDeData(a.data) === mesReferencia)
    .forEach((a) => {
      const dia = Number(a.data.slice(8, 10))
      porDia.set(dia, (porDia.get(dia) ?? 0) + precoServico(servicos, a.servicoId))
    })
  vendas
    .filter((v) => mesReferenciaDeData(v.data) === mesReferencia)
    .forEach((v) => {
      const dia = Number(v.data.slice(8, 10))
      porDia.set(dia, (porDia.get(dia) ?? 0) + v.valorTotal)
    })

  const pontos: Array<{ dia: number; valor: number }> = []
  let acumulado = 0
  for (let dia = 1; dia <= ultimoDia; dia++) {
    acumulado += porDia.get(dia) ?? 0
    pontos.push({ dia, valor: acumulado })
  }
  return pontos
}
