import { Card, EmptyState, SectionHeading } from '../../../../components/ui'
import { PayoutStatusPill } from '../../../../components/barbeiros/PayoutStatusPill'
import { ProgressoClientesPlano } from '../../../../components/barbeiro-self/ProgressoClientesPlano'
import { HistoricoRecenteBarbeiro } from '../../../../components/barbeiro-self/HistoricoRecenteBarbeiro'
import { ResumoPagamentosCard } from '../../../../components/financeiro/ResumoPagamentosCard'
import { requireBarbeiroAccess } from '../../../../lib/barbeiroAuth'
import { getBarbeiros, toAppBarbeiro } from '../../../../db/queries/barbeiros'
import { getAgendamentosDoMes } from '../../../../db/queries/agendamentos'
import { getServicosAtivos } from '../../../../db/queries/servicos'
import { getPayoutsDoMes } from '../../../../db/queries/payouts'
import { getVendas } from '../../../../db/queries/vendas'
import { getAssinaturas, getPlanosAssinatura } from '../../../../db/queries/assinaturas'
import { getClientesComHistorico } from '../../../../db/queries/clientes'
import {
  getComissaoServicosBarbeiroNoMes,
  getComissaoTotalBarbeiro,
  getComissaoVendasProdutos,
  getCortesNoMesPorBarbeiro,
  getFaturamentoGeradoPorBarbeiroNoMes,
  getHistoricoRecenteBarbeiro,
  getProgressoClientesPlano,
  getResumoPagamentosAvulso,
  getVendasDoBarbeiroNoMes,
} from '../../../../lib/derive'
import { formatBRL } from '../../../../lib/format'
import { getHojeISO, mesReferenciaDeData } from '../../../../lib/dateUtils'

export default async function MinhaComissaoPage() {
  const barbeiro = toAppBarbeiro(await requireBarbeiroAccess())

  if (barbeiro.papel === 'dono') {
    return (
      <div>
        <SectionHeading>Minha comissão</SectionHeading>
        <EmptyState
          title="Não se aplica pra dono"
          description="Como dono, o que você corta é receita direta da barbearia — não tem comissão a receber de si mesmo."
        />
      </div>
    )
  }

  const mesReferencia = mesReferenciaDeData(getHojeISO())

  const [agendamentos, servicos, payouts, vendas, assinaturas, planos, clientes, barbeiros] = await Promise.all([
    getAgendamentosDoMes(mesReferencia),
    getServicosAtivos(),
    getPayoutsDoMes(mesReferencia),
    getVendas(),
    getAssinaturas(),
    getPlanosAssinatura(),
    getClientesComHistorico(),
    getBarbeiros(),
  ])

  const cortes = getCortesNoMesPorBarbeiro(agendamentos, barbeiro.id, mesReferencia)
  const faturamentoGerado = getFaturamentoGeradoPorBarbeiroNoMes(agendamentos, servicos, barbeiro.id, mesReferencia)
  const totalVendas = getVendasDoBarbeiroNoMes(vendas, barbeiro.id, mesReferencia)
  const comissaoServicos = getComissaoServicosBarbeiroNoMes(
    agendamentos,
    servicos,
    clientes,
    planos,
    assinaturas,
    barbeiros,
    barbeiro.id,
    mesReferencia,
  )
  const comissaoVendas = getComissaoVendasProdutos(totalVendas)
  const valorAReceber = getComissaoTotalBarbeiro(
    agendamentos,
    servicos,
    clientes,
    planos,
    assinaturas,
    barbeiros,
    barbeiro.id,
    mesReferencia,
    totalVendas,
  )
  const payout = payouts.find((p) => p.barbeiroId === barbeiro.id)
  const progressoClientes = getProgressoClientesPlano(
    agendamentos,
    servicos,
    clientes,
    planos,
    assinaturas,
    barbeiros,
    barbeiro.id,
    mesReferencia,
  )
  const historicoRecente = getHistoricoRecenteBarbeiro(clientes, servicos, barbeiro.id, 10)
  const resumoPagamentos = getResumoPagamentosAvulso(agendamentos, servicos, barbeiros, mesReferencia, barbeiro.id)

  return (
    <div>
      <SectionHeading>Minha comissão</SectionHeading>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs text-text-secondary">Comissão</p>
          <p className="mt-1 text-sm text-text-primary">
            <span className="mono-value text-lg">50%</span> avulso ·{' '}
            <span className="mono-value text-lg">45%</span> plano
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-text-secondary">Cortes este mês</p>
          <p className="mono-value mt-1 text-2xl text-text-primary">{cortes}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-text-secondary">Faturamento gerado</p>
          <p className="mono-value mt-1 text-2xl text-text-primary">{formatBRL(faturamentoGerado)}</p>
        </Card>
      </div>

      <div className="mt-6">
        <Card className="flex flex-col gap-3 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-text-secondary">Valor a receber</p>
              <p className="mono-value text-3xl text-accent">{formatBRL(valorAReceber)}</p>
            </div>
            <PayoutStatusPill payout={payout} />
          </div>
          {totalVendas > 0 && (
            <>
              <div className="divider-thin" />
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>Serviços (50% avulso / 45% plano — corte cheio {formatBRL(faturamentoGerado)})</span>
                <span className="mono-value">{formatBRL(comissaoServicos)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>Produtos vendidos (10% de {formatBRL(totalVendas)})</span>
                <span className="mono-value">{formatBRL(comissaoVendas)}</span>
              </div>
            </>
          )}
        </Card>
      </div>

      <div className="mt-6">
        <ProgressoClientesPlano clientes={progressoClientes} />
      </div>

      <div className="mt-6">
        <ResumoPagamentosCard resumo={resumoPagamentos} />
      </div>

      <div className="mt-6">
        <HistoricoRecenteBarbeiro atendimentos={historicoRecente} />
      </div>
    </div>
  )
}
