import Link from 'next/link'
import { Scissors } from 'lucide-react'
import { Avatar, Button, Card, SectionHeading } from '../../../components/ui'
import { ClienteLoyaltyProgress } from '../../../components/clientes/ClienteLoyaltyProgress'
import { ClienteVisitHistory } from '../../../components/clientes/ClienteVisitHistory'
import { MeusAgendamentosCard } from '../../../components/perfil/MeusAgendamentosCard'
import { IndicarAmigoButton } from '../../../components/perfil/IndicarAmigoButton'
import { SubscriptionCancelFlow } from '../../../components/perfil/SubscriptionCancelFlow'
import { EditarMeuTelefoneButton } from '../../../components/perfil/EditarMeuTelefoneButton'
import { requireClienteAtual } from '../../../lib/clienteAuth'
import { getBaseUrl } from '../../../lib/baseUrl'
import { getBarbeiros } from '../../../db/queries/barbeiros'
import { getServicosAtivos } from '../../../db/queries/servicos'
import { getProximosAgendamentosDoCliente } from '../../../db/queries/agendamentos'
import { getAssinaturas, getPlanosAssinatura } from '../../../db/queries/assinaturas'
import { getClientesResumo } from '../../../db/queries/clientes'
import { getHojeISO } from '../../../lib/dateUtils'

export default async function PerfilPage() {
  const cliente = await requireClienteAtual()

  const [barbeiros, servicos, proximosAgendamentos, assinaturas, planos, clientes, baseUrl] = await Promise.all([
    getBarbeiros(),
    getServicosAtivos(),
    getProximosAgendamentosDoCliente(cliente.id, getHojeISO()),
    getAssinaturas(),
    getPlanosAssinatura(),
    getClientesResumo(),
    getBaseUrl(),
  ])

  const assinatura = assinaturas.find(
    (a) => a.clienteId === cliente.id && (a.status === 'em_dia' || a.status === 'atrasado'),
  )
  const plano = assinatura ? planos.find((p) => p.id === assinatura.planoId) : undefined

  const totalIndicados = clientes.filter((c) => c.indicadoPor === cliente.id).length

  return (
    <div className="flex flex-col gap-5 lg:mx-auto lg:max-w-3xl">
      <div className="flex items-center gap-3">
        <Avatar nome={cliente.nome} src={cliente.avatarUrl} size="lg" />
        <div>
          <h1 className="text-xl text-text-primary">{cliente.nome}</h1>
          <div className="flex items-center gap-1.5">
            <p className="text-xs text-text-secondary">{cliente.telefone || 'Sem telefone cadastrado'}</p>
            <EditarMeuTelefoneButton telefoneAtual={cliente.telefone} />
          </div>
        </div>
      </div>

      <MeusAgendamentosCard agendamentos={proximosAgendamentos} barbeiros={barbeiros} servicos={servicos} />

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-1.5 text-text-secondary">
            <Scissors size={14} aria-hidden="true" />
            <p className="text-xs">Cortes no total</p>
          </div>
          <p className="mono-value mt-1 text-xl text-text-primary">{cliente.historico.length}</p>
        </Card>
        <ClienteLoyaltyProgress cliente={cliente} />
      </div>

      {assinatura && plano ? (
        <SubscriptionCancelFlow assinatura={assinatura} plano={plano} />
      ) : (
        <Card className="flex items-center justify-between gap-3 p-4">
          <div>
            <p className="text-sm text-text-primary">Nenhum plano ativo</p>
            <p className="text-xs text-text-secondary">Assine e pague menos por corte.</p>
          </div>
          <Link href="/cliente/assinar">
            <Button size="sm">Ver planos</Button>
          </Link>
        </Card>
      )}

      <IndicarAmigoButton codigo={cliente.codigoIndicacao} baseUrl={baseUrl} totalIndicados={totalIndicados} />

      <div>
        <SectionHeading>Histórico</SectionHeading>
        <ClienteVisitHistory
          historico={cliente.historico}
          barbeiros={barbeiros}
          servicos={servicos}
          mostrarAvaliar
        />
      </div>
    </div>
  )
}
