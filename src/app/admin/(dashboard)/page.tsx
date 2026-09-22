import Link from 'next/link'
import { CalendarPlus, UserPlus } from 'lucide-react'
import { Button, Card, EmptyState, SectionHeading } from '../../../components/ui'
import { LinkCopyCard } from '../../../components/links/LinkCopyCard'
import { FaturamentoMesCard } from '../../../components/dashboard/FaturamentoMesCard'
import { RankingBarbeirosCard } from '../../../components/dashboard/RankingBarbeirosCard'
import { ServicosMaisVendidosCard } from '../../../components/dashboard/ServicosMaisVendidosCard'
import { requireAdminAccess } from '../../../lib/adminAuth'
import { getBarbeiros } from '../../../db/queries/barbeiros'
import { getClientesResumo } from '../../../db/queries/clientes'
import { getServicosAtivos } from '../../../db/queries/servicos'
import { getAgendamentosDoDia, getAgendamentosDoMes } from '../../../db/queries/agendamentos'
import { getAssinaturas, getPlanosAssinatura } from '../../../db/queries/assinaturas'
import { getVendas } from '../../../db/queries/vendas'
import { getFechamentoCaixaSalvo } from '../../../db/queries/fechamentoCaixa'
import {
  getAssinantesEmDia,
  getFaturamentoAcumuladoPorDia,
  getFechamentoCaixaDoDia,
  getFechamentoCaixa,
  getRankingBarbeiros,
  getServicosMaisVendidosNoMes,
} from '../../../lib/derive'
import { getHojeISO, mesReferenciaDeData, addDays } from '../../../lib/dateUtils'
import { getBaseUrl } from '../../../lib/baseUrl'
import { formatBRL } from '../../../lib/format'

export default async function DashboardPage() {
  const dono = await requireAdminAccess()
  const hojeISO = getHojeISO()
  const mesReferencia = mesReferenciaDeData(hojeISO)
  const mesAnterior = mesReferenciaDeData(addDays(`${mesReferencia}-01`, -1))

  const [
    barbeiros,
    clientes,
    servicos,
    agendamentosHoje,
    agendamentosMes,
    agendamentosMesAnterior,
    assinaturas,
    planos,
    vendas,
    fechamentoSalvo,
    baseUrl,
  ] = await Promise.all([
    getBarbeiros(dono.barbeariaId),
    getClientesResumo(dono.barbeariaId),
    getServicosAtivos(dono.barbeariaId),
    getAgendamentosDoDia(hojeISO, dono.barbeariaId),
    getAgendamentosDoMes(mesReferencia, dono.barbeariaId),
    getAgendamentosDoMes(mesAnterior, dono.barbeariaId),
    getAssinaturas(dono.barbeariaId),
    getPlanosAssinatura(dono.barbeariaId),
    getVendas(dono.barbeariaId),
    getFechamentoCaixaSalvo(hojeISO, dono.barbeariaId),
    getBaseUrl(),
  ])

  const fechamentoDoDia =
    fechamentoSalvo ??
    getFechamentoCaixaDoDia(agendamentosHoje, servicos, vendas, assinaturas, planos, clientes, hojeISO)

  const confirmadosHoje = agendamentosHoje
    .filter((a) => !a.continuacaoDeId && (a.status === 'confirmado' || a.status === 'atendido'))
    .sort((a, b) => a.hora.localeCompare(b.hora))

  const assinantesEmDia = getAssinantesEmDia(assinaturas)

  const fechamentoDoMes = getFechamentoCaixa(agendamentosMes, servicos, vendas, assinaturas, planos, clientes, mesReferencia)
  const fechamentoDoMesAnterior = getFechamentoCaixa(
    agendamentosMesAnterior,
    servicos,
    vendas,
    assinaturas,
    planos,
    clientes,
    mesAnterior,
  )
  const pontosAcumulado = getFaturamentoAcumuladoPorDia(agendamentosMes, servicos, vendas, mesReferencia, hojeISO)
  const rankingBarbeiros = getRankingBarbeiros(barbeiros, agendamentosMes, servicos, mesReferencia)
  const servicosMaisVendidos = getServicosMaisVendidosNoMes(agendamentosMes, servicos, mesReferencia)

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl text-text-primary">Olá, {dono.nome.split(' ')[0]}</h1>
        <p className="text-sm text-text-secondary">Aqui está o resumo de hoje.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr]">
        <Card
          className="anim-in card-hover-border flex flex-col justify-between border-accent bg-accent p-6"
          style={{ animationDelay: '0ms' }}
        >
          <p className="text-xs text-white/70">Faturado hoje</p>
          <p className="mono-value mt-2 text-4xl text-white">{formatBRL(fechamentoDoDia.total)}</p>
        </Card>
        <div className="flex flex-col gap-4">
          <Card className="anim-in card-hover-border p-4" style={{ animationDelay: '60ms' }}>
            <p className="text-xs text-text-secondary">Agendamentos hoje</p>
            <p className="mono-value mt-1 text-2xl text-text-primary">{confirmadosHoje.length}</p>
          </Card>
          <Card className="anim-in card-hover-border p-4" style={{ animationDelay: '100ms' }}>
            <p className="text-xs text-text-secondary">Assinantes em dia</p>
            <p className="mono-value mt-1 text-2xl text-text-primary">{assinantesEmDia}</p>
          </Card>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/agenda">
          <Button size="sm">
            <CalendarPlus size={16} aria-hidden="true" />
            Agendar horário
          </Button>
        </Link>
        <Link href="/admin/clientes">
          <Button size="sm" variant="secondary">
            <UserPlus size={16} aria-hidden="true" />
            Novo cliente
          </Button>
        </Link>
      </div>

      <div>
        <SectionHeading>Horários de hoje</SectionHeading>
        {confirmadosHoje.length === 0 ? (
          <EmptyState title="Nada agendado hoje" description="A agenda de hoje está livre." />
        ) : (
          <div className="flex flex-col gap-2">
            {confirmadosHoje.map((a, index) => {
              const cliente = clientes.find((c) => c.id === a.clienteId)
              const barbeiro = barbeiros.find((b) => b.id === a.barbeiroId)
              const nomesServicos = a.servicoIds
                .map((id) => servicos.find((s) => s.id === id)?.nome)
                .filter(Boolean)
                .join(' + ')
              return (
                <Card
                  key={a.id}
                  className="anim-in card-hover-border flex items-center justify-between px-4 py-3"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <div>
                    <p className="text-sm text-text-primary">{cliente?.nome ?? 'Cliente avulso'}</p>
                    <p className="text-xs text-text-secondary">
                      {nomesServicos} · {barbeiro?.nome}
                    </p>
                  </div>
                  <span className="mono-value text-sm text-brass">{a.hora}</span>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <FaturamentoMesCard
        valorAtual={fechamentoDoMes.avulso + fechamentoDoMes.produtos}
        valorMesAnterior={fechamentoDoMesAnterior.avulso + fechamentoDoMesAnterior.produtos}
        pontosAcumulado={pontosAcumulado}
      />

      <RankingBarbeirosCard ranking={rankingBarbeiros} />

      <ServicosMaisVendidosCard servicos={servicosMaisVendidos} />

      <div>
        <SectionHeading>Links de acesso</SectionHeading>
        <div className="flex flex-col gap-3">
          <LinkCopyCard
            titulo="Link do cliente"
            descricao="Pra clientes agendarem horário ou assinarem um plano. Se a pessoa ainda não tem conta, ela consegue criar direto por aqui."
            link={`${baseUrl}/entrar/cliente?utm_source=painel&utm_medium=link_compartilhado`}
          />
          <LinkCopyCard
            titulo="Link do barbeiro"
            descricao="Pra barbeiros já cadastrados entrarem no painel deles. Um barbeiro novo é convidado pelo e-mail em Barbeiros → Novo barbeiro, não por esse link."
            link={`${baseUrl}/entrar/barbeiro?utm_source=painel&utm_medium=link_compartilhado`}
          />
        </div>
      </div>
    </div>
  )
}
