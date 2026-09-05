import type {
  Agendamento,
  Assinatura,
  Barbeiro,
  Cliente,
  FormaPagamento,
  PlanoAssinatura,
  Produto,
  Servico,
  Venda,
} from '../types'
import { getHojeISO, getHoraAtualBrasil } from './dateUtils'

function mesReferenciaDeData(dataISO: string): string {
  return dataISO.slice(0, 7)
}

/** 'atendido' = o barbeiro já registrou que rolou de verdade, sempre conta.
 * 'confirmado' = marcado, mas só conta depois que o horário realmente
 * passou — antes disso é dinheiro que ainda nem aconteceu, não pode entrar
 * em faturamento/comissão como se já tivesse batido no caixa. Linhas de
 * continuação (agendamento que ocupa mais de um slot por causa da duração)
 * nunca contam — são a mesma visita do agendamento original, não uma
 * segunda. */
function contaComoAtendimento(a: Pick<Agendamento, 'status' | 'continuacaoDeId' | 'data' | 'hora'>): boolean {
  if (a.continuacaoDeId) return false
  if (a.status === 'atendido') return true
  if (a.status !== 'confirmado') return false

  const hoje = getHojeISO()
  if (a.data < hoje) return true
  if (a.data > hoje) return false
  return a.hora <= getHoraAtualBrasil()
}

function precoServico(servicos: Servico[], servicoId: string | undefined): number {
  return servicos.find((s) => s.id === servicoId)?.precoAvulso ?? 0
}

/** Quantas vezes o cliente já usou esse serviço neste mês — base pro limite
 * mensal de itens como a barboterapia do plano VIP (4x/mês). Usa o histórico
 * de atendimentos já registrados (o que realmente aconteceu), não a agenda. */
export function getUsosServicoNoMes(
  cliente: Cliente | undefined,
  servicoId: string,
  mesReferencia: string,
): number {
  if (!cliente) return 0
  return cliente.historico.filter(
    (h) => h.servicoId === servicoId && mesReferenciaDeData(h.data) === mesReferencia,
  ).length
}

function inclusaoDoServicoNoPlano(plano: PlanoAssinatura | undefined, servicoId: string) {
  return plano?.servicosInclusos.find((i) => i.servicoId === servicoId)
}

/** Preço que o cliente paga por um serviço — grátis se o plano dele cobre
 * esse serviço (e ainda não estourou o limite mensal, quando existe), 10%
 * off nos demais serviços pra quem é assinante em dia. */
export function getPrecoServicoParaCliente(
  servico: Servico,
  assinanteAtivo: boolean,
  inclusao: { limiteMensal: number | null } | undefined,
  usosNoMes: number,
): { valor: number; incluido: boolean; esgotado: boolean } {
  const comDesconto = Math.round(servico.precoAvulso * 0.9 * 100) / 100

  if (!assinanteAtivo) return { valor: servico.precoAvulso, incluido: false, esgotado: false }
  if (!inclusao) return { valor: comDesconto, incluido: false, esgotado: false }

  const esgotado = inclusao.limiteMensal !== null && usosNoMes >= inclusao.limiteMensal
  if (esgotado) return { valor: comDesconto, incluido: false, esgotado: true }
  return { valor: 0, incluido: true, esgotado: false }
}

function clientesComAssinaturaAtiva(assinaturas: Assinatura[]): Map<string, string> {
  const map = new Map<string, string>()
  assinaturas.filter((a) => a.status === 'em_dia').forEach((a) => map.set(a.clienteId, a.planoId))
  return map
}

/** Pra mostrar na agenda do barbeiro/dono se aquele atendimento é de um
 * cliente com plano (basta UM dos serviços pedidos estar incluso no plano
 * ativo dele) ou avulso — mesma regra usada pra calcular o preço/comissão. */
export function getTipoAtendimento(
  servicoIds: string[],
  clienteId: string | undefined,
  planos: PlanoAssinatura[],
  assinaturas: Assinatura[],
): 'plano' | 'avulso' {
  if (servicoIds.length === 0 || !clienteId) return 'avulso'
  const planoId = clientesComAssinaturaAtiva(assinaturas).get(clienteId)
  if (!planoId) return 'avulso'
  const plano = planos.find((p) => p.id === planoId)
  const incluido = servicoIds.some((id) => plano?.servicosInclusos.some((i) => i.servicoId === id))
  return incluido ? 'plano' : 'avulso'
}

function precoRealAgendamento(
  servicos: Servico[],
  clientes: Cliente[],
  planos: PlanoAssinatura[],
  planoAtivoPorCliente: Map<string, string>,
  agendamento: Agendamento,
): number {
  const planoId = agendamento.clienteId ? planoAtivoPorCliente.get(agendamento.clienteId) : undefined
  const assinanteAtivo = Boolean(planoId)
  const plano = planoId ? planos.find((p) => p.id === planoId) : undefined
  const cliente = agendamento.clienteId ? clientes.find((c) => c.id === agendamento.clienteId) : undefined

  return agendamento.servicoIds.reduce((total, servicoId) => {
    const servico = servicos.find((s) => s.id === servicoId)
    if (!servico) return total
    const inclusao = inclusaoDoServicoNoPlano(plano, servico.id)
    const usos = inclusao ? getUsosServicoNoMes(cliente, servico.id, mesReferenciaDeData(agendamento.data)) : 0
    return total + getPrecoServicoParaCliente(servico, assinanteAtivo, inclusao, usos).valor
  }, 0)
}

export function getCortesNoMesPorBarbeiro(
  agendamentos: Agendamento[],
  barbeiroId: string,
  mesReferencia: string,
): number {
  return agendamentos.filter(
    (a) =>
      a.barbeiroId === barbeiroId &&
      contaComoAtendimento(a) &&
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
        contaComoAtendimento(a) &&
        mesReferenciaDeData(a.data) === mesReferencia,
    )
    .reduce((total, a) => total + a.servicoIds.reduce((s, id) => s + precoServico(servicos, id), 0), 0)
}

/** Comissão sobre venda de produto é fixa pra todo barbeiro. */
export const COMISSAO_VENDA_PRODUTO_PERCENT = 10

/** Corte avulso (fora do plano) — comissão fixa pra todo barbeiro. */
export const COMISSAO_AVULSO_PERCENT = 50

/** Corte coberto por plano de assinatura — diferente do avulso, aqui a
 * comissão não é por serviço nem por visita: é um valor fixo pago UMA VEZ
 * por cliente a cada mês, sobre o valor da mensalidade dele (não sobre o
 * preço do serviço) — não importa quantas vezes esse cliente volte a
 * cortar no mesmo mês. Fica com o barbeiro (não-dono) que atendeu o
 * primeiro corte coberto pelo plano daquele cliente no mês (ver
 * getAtivadoresDoPlanoNoMes) — se ele voltar (com esse ou outro barbeiro)
 * depois, não gera comissão de plano de novo. */
export const COMISSAO_PLANO_PERCENT = 45

/** Acha, pra cada cliente com plano ativo, o atendimento que "ativa" a
 * comissão de plano daquele mês: o primeiro (cronologicamente, entre os
 * barbeiros que RECEBEM comissão) que usou de fato um serviço coberto
 * pelo plano (e ainda dentro do limite mensal dele, se houver). O dono
 * nunca conta como candidato aqui — ele não recebe comissão, então se ele
 * for o primeiro a atender esse cliente no mês isso é ignorado, e o
 * primeiro barbeiro de verdade que atender (mesmo que depois do dono) é
 * quem leva a comissão inteira. Só existe UM ativador por cliente por
 * mês, mesmo que ele volte várias vezes. */
function getAtivadoresDoPlanoNoMes(
  agendamentos: Agendamento[],
  clientes: Cliente[],
  planos: PlanoAssinatura[],
  barbeiros: Barbeiro[],
  planoAtivoPorCliente: Map<string, string>,
  mesReferencia: string,
): Map<string, string> {
  const idsQueRecebemComissao = new Set(barbeiros.filter((b) => b.papel !== 'dono').map((b) => b.id))

  const doMes = agendamentos
    .filter(
      (a) =>
        contaComoAtendimento(a) &&
        a.clienteId &&
        idsQueRecebemComissao.has(a.barbeiroId) &&
        mesReferenciaDeData(a.data) === mesReferencia,
    )
    .sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora))

  const ativadores = new Map<string, string>()
  for (const a of doMes) {
    const clienteId = a.clienteId as string
    if (ativadores.has(clienteId)) continue
    const planoId = planoAtivoPorCliente.get(clienteId)
    if (!planoId) continue
    const plano = planos.find((p) => p.id === planoId)
    const cliente = clientes.find((c) => c.id === clienteId)

    const temServicoCoberto = a.servicoIds.some((servicoId) => {
      const inclusao = inclusaoDoServicoNoPlano(plano, servicoId)
      if (!inclusao) return false
      const usos = getUsosServicoNoMes(cliente, servicoId, mesReferencia)
      return inclusao.limiteMensal === null || usos < inclusao.limiteMensal
    })
    if (temServicoCoberto) ativadores.set(clienteId, a.id)
  }
  return ativadores
}

export function getVendasDoBarbeiroNoMes(vendas: Venda[], barbeiroId: string, mesReferencia: string): number {
  return vendas
    .filter((v) => v.barbeiroId === barbeiroId && mesReferenciaDeData(v.data) === mesReferencia)
    .reduce((total, v) => total + v.valorTotal, 0)
}

export function getComissaoVendasProdutos(totalVendas: number): number {
  return Math.round(totalVendas * (COMISSAO_VENDA_PRODUTO_PERCENT / 100) * 100) / 100
}

/** Comissão de um atendimento específico: serviço avulso (não coberto pelo
 * plano do cliente, ou coberto mas com limite mensal já esgotado) sempre
 * rende COMISSAO_AVULSO_PERCENT do preço cheio do serviço. Serviço coberto
 * pelo plano não rende comissão por serviço nenhuma — a comissão de plano
 * é o valor fixo (ver COMISSAO_PLANO_PERCENT) somado uma única vez, só se
 * esse for o atendimento "ativador" do plano daquele cliente no mês. */
function getComissaoDoAtendimento(
  agendamento: Agendamento,
  servicos: Servico[],
  clientes: Cliente[],
  planos: PlanoAssinatura[],
  planoAtivoPorCliente: Map<string, string>,
  ativadoresDoMes: Map<string, string>,
): number {
  if (agendamento.servicoIds.length === 0) return 0

  const planoId = agendamento.clienteId ? planoAtivoPorCliente.get(agendamento.clienteId) : undefined
  const assinanteAtivo = Boolean(planoId)
  const plano = planoId ? planos.find((p) => p.id === planoId) : undefined
  const cliente = agendamento.clienteId ? clientes.find((c) => c.id === agendamento.clienteId) : undefined

  let total = 0
  for (const servicoId of agendamento.servicoIds) {
    const servico = servicos.find((s) => s.id === servicoId)
    if (!servico) continue

    const inclusao = inclusaoDoServicoNoPlano(plano, servico.id)
    const usos = inclusao ? getUsosServicoNoMes(cliente, servico.id, mesReferenciaDeData(agendamento.data)) : 0
    const { incluido } = getPrecoServicoParaCliente(servico, assinanteAtivo, inclusao, usos)
    if (!incluido) {
      total += Math.round(servico.precoAvulso * (COMISSAO_AVULSO_PERCENT / 100) * 100) / 100
    }
  }

  const ehAtivadorDoPlano = agendamento.clienteId && ativadoresDoMes.get(agendamento.clienteId) === agendamento.id
  if (ehAtivadorDoPlano && plano) {
    total += Math.round(plano.valorMensal * (COMISSAO_PLANO_PERCENT / 100) * 100) / 100
  }

  return Math.round(total * 100) / 100
}

export interface ProgressoClientePlano {
  clienteId: string
  clienteNome: string
  cortesNoMes: number
  comissaoGanha: number
}

/** Pra cada cliente de plano que o barbeiro atendeu no mês, mostra quantos
 * cortes já fez com ele e quanto de comissão isso já rendeu (o valor fixo
 * de plano só entra se ESSE barbeiro foi quem atendeu o corte que ativou
 * o plano daquele cliente no mês — ver getAtivadoresDoPlanoNoMes). */
export function getProgressoClientesPlano(
  agendamentos: Agendamento[],
  servicos: Servico[],
  clientes: Cliente[],
  planos: PlanoAssinatura[],
  assinaturas: Assinatura[],
  barbeiros: Barbeiro[],
  barbeiroId: string,
  mesReferencia: string,
): ProgressoClientePlano[] {
  const planoAtivoPorCliente = clientesComAssinaturaAtiva(assinaturas)
  const ativadoresDoMes = getAtivadoresDoPlanoNoMes(
    agendamentos,
    clientes,
    planos,
    barbeiros,
    planoAtivoPorCliente,
    mesReferencia,
  )
  const doBarbeiroNoMes = agendamentos.filter(
    (a) =>
      a.barbeiroId === barbeiroId && contaComoAtendimento(a) && mesReferenciaDeData(a.data) === mesReferencia,
  )

  const porCliente = new Map<string, Agendamento[]>()
  for (const a of doBarbeiroNoMes) {
    if (!a.clienteId || !planoAtivoPorCliente.has(a.clienteId)) continue
    const lista = porCliente.get(a.clienteId) ?? []
    lista.push(a)
    porCliente.set(a.clienteId, lista)
  }

  const resultado: ProgressoClientePlano[] = []
  for (const [clienteId, doCliente] of porCliente) {
    const cliente = clientes.find((c) => c.id === clienteId)
    if (!cliente) continue
    const cortesNoMes = doCliente.length
    const comissaoGanha = doCliente.reduce(
      (sum, a) => sum + getComissaoDoAtendimento(a, servicos, clientes, planos, planoAtivoPorCliente, ativadoresDoMes),
      0,
    )
    resultado.push({
      clienteId,
      clienteNome: cliente.nome,
      cortesNoMes,
      comissaoGanha: Math.round(comissaoGanha * 100) / 100,
    })
  }

  return resultado.sort((a, b) => b.comissaoGanha - a.comissaoGanha || b.cortesNoMes - a.cortesNoMes)
}

export interface AtendimentoRecente {
  id: string
  clienteNome: string
  servicoNome: string
  data: string
}

/** Últimos atendimentos do barbeiro (qualquer cliente), mais recente
 * primeiro — ajuda a lembrar quem ele já cortou recentemente. */
export function getHistoricoRecenteBarbeiro(
  clientes: Cliente[],
  servicos: Servico[],
  barbeiroId: string,
  limite: number,
): AtendimentoRecente[] {
  const registros: AtendimentoRecente[] = []
  for (const cliente of clientes) {
    for (const h of cliente.historico) {
      if (h.barbeiroId !== barbeiroId) continue
      registros.push({
        id: h.id,
        clienteNome: cliente.nome,
        servicoNome: servicos.find((s) => s.id === h.servicoId)?.nome ?? 'Serviço',
        data: h.data,
      })
    }
  }
  return registros.sort((a, b) => b.data.localeCompare(a.data)).slice(0, limite)
}

export function getComissaoServicosBarbeiroNoMes(
  agendamentos: Agendamento[],
  servicos: Servico[],
  clientes: Cliente[],
  planos: PlanoAssinatura[],
  assinaturas: Assinatura[],
  barbeiros: Barbeiro[],
  barbeiroId: string,
  mesReferencia: string,
): number {
  const planoAtivoPorCliente = clientesComAssinaturaAtiva(assinaturas)
  const ativadoresDoMes = getAtivadoresDoPlanoNoMes(
    agendamentos,
    clientes,
    planos,
    barbeiros,
    planoAtivoPorCliente,
    mesReferencia,
  )
  const doBarbeiroNoMes = agendamentos.filter(
    (a) => a.barbeiroId === barbeiroId && contaComoAtendimento(a) && mesReferenciaDeData(a.data) === mesReferencia,
  )

  return (
    Math.round(
      doBarbeiroNoMes.reduce(
        (sum, a) =>
          sum + getComissaoDoAtendimento(a, servicos, clientes, planos, planoAtivoPorCliente, ativadoresDoMes),
        0,
      ) * 100,
    ) / 100
  )
}

/** Valor total a receber do barbeiro no mês: comissão de serviços (avulso
 * 50% / plano 45% com meta por cliente) + comissão de vendas de produto
 * (taxa fixa de 10%). */
export function getComissaoTotalBarbeiro(
  agendamentos: Agendamento[],
  servicos: Servico[],
  clientes: Cliente[],
  planos: PlanoAssinatura[],
  assinaturas: Assinatura[],
  barbeiros: Barbeiro[],
  barbeiroId: string,
  mesReferencia: string,
  totalVendasProdutos: number,
): number {
  const comissaoServicos = getComissaoServicosBarbeiroNoMes(
    agendamentos,
    servicos,
    clientes,
    planos,
    assinaturas,
    barbeiros,
    barbeiroId,
    mesReferencia,
  )
  return Math.round((comissaoServicos + getComissaoVendasProdutos(totalVendasProdutos)) * 100) / 100
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

/** Só conta assinatura que já foi paga de verdade pelo menos uma vez
 * ('em_dia' ou 'atrasado') — 'aguardando' é cadastro feito mas pagamento
 * nunca confirmado (o cliente pode nem ter chegado a pagar), não pode
 * entrar como receita de verdade no MRR/fechamento de caixa. */
export function getMRR(assinaturas: Assinatura[], planos: PlanoAssinatura[]): number {
  return assinaturas
    .filter((a) => a.status === 'em_dia' || a.status === 'atrasado')
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
    (a) => contaComoAtendimento(a) && mesReferenciaDeData(a.data) === mesReferencia,
  )
  if (confirmados.length === 0) return 0
  const total = confirmados.reduce(
    (sum, a) => sum + a.servicoIds.reduce((s, id) => s + precoServico(servicos, id), 0),
    0,
  )
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
  const planoAtivoPorCliente = clientesComAssinaturaAtiva(assinaturas)

  const avulso = agendamentos
    .filter((a) => contaComoAtendimento(a) && mesReferenciaDeData(a.data) === mesReferencia)
    .reduce((sum, a) => sum + precoRealAgendamento(servicos, clientes, planos, planoAtivoPorCliente, a), 0)

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
  const planoAtivoPorCliente = clientesComAssinaturaAtiva(assinaturas)

  const avulso = agendamentos
    .filter((a) => contaComoAtendimento(a) && a.data === dataISO)
    .reduce((sum, a) => sum + precoRealAgendamento(servicos, clientes, planos, planoAtivoPorCliente, a), 0)

  const produtos = vendas
    .filter((v) => v.data === dataISO)
    .reduce((sum, v) => sum + v.valorTotal, 0)

  const assinatura = assinaturas
    .filter((a) => (a.status === 'em_dia' || a.status === 'atrasado') && a.proximaCobranca === dataISO)
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

/** Fechamento de caixa de uma semana (segunda a domingo) — mesma lógica da
 * versão diária, só que somando o intervalo inteiro em vez de um dia exato. */
export function getFechamentoCaixaDaSemana(
  agendamentos: Agendamento[],
  servicos: Servico[],
  vendas: Venda[],
  assinaturas: Assinatura[],
  planos: PlanoAssinatura[],
  clientes: Cliente[],
  inicioISO: string,
  fimISO: string,
) {
  const planoAtivoPorCliente = clientesComAssinaturaAtiva(assinaturas)

  const avulso = agendamentos
    .filter((a) => contaComoAtendimento(a) && a.data >= inicioISO && a.data <= fimISO)
    .reduce((sum, a) => sum + precoRealAgendamento(servicos, clientes, planos, planoAtivoPorCliente, a), 0)

  const produtos = vendas
    .filter((v) => v.data >= inicioISO && v.data <= fimISO)
    .reduce((sum, v) => sum + v.valorTotal, 0)

  const assinatura = assinaturas
    .filter(
      (a) => (a.status === 'em_dia' || a.status === 'atrasado') && a.proximaCobranca >= inicioISO && a.proximaCobranca <= fimISO,
    )
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

export interface ServicoMaisVendido {
  servicoId: string
  servicoNome: string
  quantidade: number
  faturamento: number
}

/** Quais serviços mais renderam no mês (preço cheio, sem os descontos de
 * plano/assinante) — mostra o que está puxando faturamento, não só volume. */
export function getServicosMaisVendidosNoMes(
  agendamentos: Agendamento[],
  servicos: Servico[],
  mesReferencia: string,
): ServicoMaisVendido[] {
  const porServico = new Map<string, { quantidade: number; faturamento: number }>()
  agendamentos
    .filter((a) => contaComoAtendimento(a) && mesReferenciaDeData(a.data) === mesReferencia)
    .forEach((a) => {
      a.servicoIds.forEach((servicoId) => {
        const atual = porServico.get(servicoId) ?? { quantidade: 0, faturamento: 0 }
        atual.quantidade += 1
        atual.faturamento += precoServico(servicos, servicoId)
        porServico.set(servicoId, atual)
      })
    })

  return Array.from(porServico.entries())
    .map(([servicoId, dados]) => ({
      servicoId,
      servicoNome: servicos.find((s) => s.id === servicoId)?.nome ?? 'Serviço',
      quantidade: dados.quantidade,
      faturamento: Math.round(dados.faturamento * 100) / 100,
    }))
    .sort((a, b) => b.faturamento - a.faturamento)
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
    .filter((a) => contaComoAtendimento(a) && mesReferenciaDeData(a.data) === mesReferencia)
    .forEach((a) => {
      const dia = Number(a.data.slice(8, 10))
      const valorAgendamento = a.servicoIds.reduce((s, id) => s + precoServico(servicos, id), 0)
      porDia.set(dia, (porDia.get(dia) ?? 0) + valorAgendamento)
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

export interface ResumoPagamentosAvulso {
  porFormaPagamento: { forma: FormaPagamento; quantidade: number; valor: number }[]
  porCaixa: { barbeiroId: string; barbeiroNome: string; quantidade: number; valor: number }[]
}

/** Só organização/relatório do que já foi marcado como avulso e teve a
 * forma de pagamento/caixa preenchida — não é fechamento de caixa nem
 * afeta comissão, é só pra saber "quanto entrou de pix/cartão/dinheiro" e
 * "quanto ficou com o caixa de qual barbeiro/dono". Se `barbeiroId` for
 * passado, filtra só os atendimentos daquele barbeiro. */
export function getResumoPagamentosAvulso(
  agendamentos: Agendamento[],
  servicos: Servico[],
  barbeiros: Barbeiro[],
  mesReferencia: string,
  barbeiroId?: string,
): ResumoPagamentosAvulso {
  const doMes = agendamentos.filter(
    (a) =>
      contaComoAtendimento(a) &&
      mesReferenciaDeData(a.data) === mesReferencia &&
      (!barbeiroId || a.barbeiroId === barbeiroId) &&
      a.formaPagamento,
  )

  const valorDoAgendamento = (a: Agendamento) => a.servicoIds.reduce((s, id) => s + precoServico(servicos, id), 0)

  const formas: FormaPagamento[] = ['pix', 'cartao', 'dinheiro']

  return {
    porFormaPagamento: formas.map((forma) => {
      const doForma = doMes.filter((a) => a.formaPagamento === forma)
      return {
        forma,
        quantidade: doForma.length,
        valor: Math.round(doForma.reduce((s, a) => s + valorDoAgendamento(a), 0) * 100) / 100,
      }
    }),
    porCaixa: barbeiros.map((destinatario) => {
      const doCaixa = doMes.filter((a) => a.caixaDestinoBarbeiroId === destinatario.id)
      return {
        barbeiroId: destinatario.id,
        barbeiroNome: destinatario.nome,
        quantidade: doCaixa.length,
        valor: Math.round(doCaixa.reduce((s, a) => s + valorDoAgendamento(a), 0) * 100) / 100,
      }
    }),
  }
}

export interface ClientePlanoSemVisita {
  clienteId: string
  clienteNome: string
  clienteTelefone: string
  planoNome: string
}

/** Clientes com plano em dia que ainda não tiveram nenhum atendimento
 * contado (de nenhum barbeiro) nesse mês — é uma oportunidade real: quem
 * chamar e atender primeiro é quem fica com a comissão de plano daquele
 * cliente (ver getAtivadoresDoPlanoNoMes). Igual pra todos os barbeiros,
 * não é "cliente de ninguém" específico. */
export function getClientesPlanoSemVisitaNoMes(
  agendamentos: Agendamento[],
  clientes: Cliente[],
  planos: PlanoAssinatura[],
  assinaturas: Assinatura[],
  barbeiros: Barbeiro[],
  mesReferencia: string,
): ClientePlanoSemVisita[] {
  const planoAtivoPorCliente = clientesComAssinaturaAtiva(assinaturas)
  const ativadoresDoMes = getAtivadoresDoPlanoNoMes(
    agendamentos,
    clientes,
    planos,
    barbeiros,
    planoAtivoPorCliente,
    mesReferencia,
  )

  const resultado: ClientePlanoSemVisita[] = []
  for (const [clienteId, planoId] of planoAtivoPorCliente) {
    if (ativadoresDoMes.has(clienteId)) continue
    const cliente = clientes.find((c) => c.id === clienteId)
    const plano = planos.find((p) => p.id === planoId)
    if (!cliente || !plano) continue
    resultado.push({
      clienteId,
      clienteNome: cliente.nome,
      clienteTelefone: cliente.telefone,
      planoNome: plano.nome,
    })
  }
  return resultado.sort((a, b) => a.clienteNome.localeCompare(b.clienteNome))
}
