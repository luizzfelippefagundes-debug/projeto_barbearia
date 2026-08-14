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

function precoServico(servicos: Servico[], servicoId: string | undefined): number {
  return servicos.find((s) => s.id === servicoId)?.precoAvulso ?? 0
}

export function getCortesNoMesPorBarbeiro(
  agendamentos: Agendamento[],
  barbeiroId: string,
  mesReferencia: string,
): number {
  return agendamentos.filter(
    (a) =>
      a.barbeiroId === barbeiroId &&
      a.status === 'confirmado' &&
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
        a.status === 'confirmado' &&
        mesReferenciaDeData(a.data) === mesReferencia,
    )
    .reduce((total, a) => total + precoServico(servicos, a.servicoId), 0)
}

export function getValorAReceber(barbeiro: Barbeiro, faturamentoGerado: number): number {
  return Math.round(faturamentoGerado * (barbeiro.comissaoPercent / 100) * 100) / 100
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
    (a) => a.status === 'confirmado' && mesReferenciaDeData(a.data) === mesReferencia,
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
  const clientesComAssinatura = new Set(
    clientes.filter((c) => c.assinaturaId).map((c) => c.id),
  )

  const avulso = agendamentos
    .filter(
      (a) =>
        a.status === 'confirmado' &&
        mesReferenciaDeData(a.data) === mesReferencia &&
        !(a.clienteId && clientesComAssinatura.has(a.clienteId)),
    )
    .reduce((sum, a) => sum + precoServico(servicos, a.servicoId), 0)

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
