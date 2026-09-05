import { Card, SectionHeading } from '../../../../components/ui'
import { LinkCopyCard } from '../../../../components/links/LinkCopyCard'
import { MinhaFotoUpload } from '../../../../components/barbeiro-self/MinhaFotoUpload'
import { EditarMeuNomeButton } from '../../../../components/barbeiro-self/EditarMeuNomeButton'
import { MinhaSegurancaButton } from '../../../../components/barbeiro-self/MinhaSegurancaButton'
import { MeuHorarioTrabalhoButton } from '../../../../components/barbeiro-self/MeuHorarioTrabalhoButton'
import { requireBarbeiroAccess } from '../../../../lib/barbeiroAuth'
import { getBarbeiros, toAppBarbeiro } from '../../../../db/queries/barbeiros'
import { getAgendamentosDoMes } from '../../../../db/queries/agendamentos'
import { getServicosAtivos } from '../../../../db/queries/servicos'
import { getVendas } from '../../../../db/queries/vendas'
import { getAssinaturas, getPlanosAssinatura } from '../../../../db/queries/assinaturas'
import { getClientesComHistorico } from '../../../../db/queries/clientes'
import { getComissaoTotalBarbeiro, getCortesNoMesPorBarbeiro, getVendasDoBarbeiroNoMes } from '../../../../lib/derive'
import { formatBRL } from '../../../../lib/format'
import { DIAS_SEMANA, getHojeISO, mesReferenciaDeData } from '../../../../lib/dateUtils'
import { getBaseUrl } from '../../../../lib/baseUrl'

export default async function MeuPerfilPage() {
  const barbeiro = toAppBarbeiro(await requireBarbeiroAccess())
  const mesReferencia = mesReferenciaDeData(getHojeISO())

  const [agendamentos, servicos, vendas, assinaturas, planos, clientes, barbeiros, baseUrl] = await Promise.all([
    getAgendamentosDoMes(mesReferencia),
    getServicosAtivos(),
    getVendas(),
    getAssinaturas(),
    getPlanosAssinatura(),
    getClientesComHistorico(),
    getBarbeiros(),
    getBaseUrl(),
  ])

  const cortes = getCortesNoMesPorBarbeiro(agendamentos, barbeiro.id, mesReferencia)
  const totalVendas = getVendasDoBarbeiroNoMes(vendas, barbeiro.id, mesReferencia)
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

  return (
    <div className="flex flex-col gap-8">
      <div>
        <SectionHeading>Meu perfil</SectionHeading>
        <Card className="flex flex-col gap-4 p-5">
          <div className="flex items-center gap-4">
            <MinhaFotoUpload nome={barbeiro.nome} avatarUrl={barbeiro.avatarUrl} />
            <div className="flex flex-1 items-center gap-2">
              <div>
                <h2 className="text-base text-text-primary">{barbeiro.nome}</h2>
                <p className="text-xs text-text-secondary">Toque na foto pra trocar</p>
              </div>
              <EditarMeuNomeButton nomeAtual={barbeiro.nome} />
            </div>
          </div>
          <div className="border-t border-border pt-4">
            <MinhaSegurancaButton />
          </div>
        </Card>
      </div>

      <div>
        <SectionHeading>Este mês</SectionHeading>
        <div className={`grid grid-cols-1 gap-4 ${barbeiro.papel === 'dono' ? '' : 'sm:grid-cols-2'}`}>
          <Card className="p-4">
            <p className="text-xs text-text-secondary">Cortes este mês</p>
            <p className="mono-value mt-1 text-2xl text-text-primary">{cortes}</p>
          </Card>
          {barbeiro.papel !== 'dono' && (
            <Card className="p-4">
              <p className="text-xs text-text-secondary">Valor a receber</p>
              <p className="mono-value mt-1 text-2xl text-accent">{formatBRL(valorAReceber)}</p>
            </Card>
          )}
        </div>
      </div>

      <div>
        <SectionHeading>Horário de trabalho</SectionHeading>
        <Card className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-text-primary">
              {barbeiro.diasTrabalho
                .slice()
                .sort()
                .map((d) => DIAS_SEMANA[d])
                .join(', ')}
            </p>
            <p className="text-xs text-text-secondary">
              {barbeiro.horaInicio} às {barbeiro.horaFim} — é o que aparece pro cliente agendar
            </p>
          </div>
          <MeuHorarioTrabalhoButton
            diasTrabalhoAtual={barbeiro.diasTrabalho}
            horaInicioAtual={barbeiro.horaInicio}
            horaFimAtual={barbeiro.horaFim}
          />
        </Card>
      </div>

      <div>
        <SectionHeading>Link de agendamento</SectionHeading>
        <LinkCopyCard
          titulo="Link do cliente"
          descricao="Manda esse link pros seus clientes marcarem horário direto — funciona pra qualquer barbeiro da barbearia."
          link={`${baseUrl}/entrar/cliente?utm_source=barbeiro&utm_medium=link_compartilhado`}
        />
      </div>
    </div>
  )
}
