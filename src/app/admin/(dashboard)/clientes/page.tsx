import { SectionHeading } from '../../../../components/ui'
import { ClientesListClient } from '../../../../components/clientes/ClientesListClient'
import { NovoClienteButton } from '../../../../components/clientes/NovoClienteButton'
import { ClienteDetailDrawer } from '../../../../components/clientes/ClienteDetailDrawer'
import { getClientesResumo, getClienteComHistorico } from '../../../../db/queries/clientes'
import { getBarbeiros } from '../../../../db/queries/barbeiros'
import { getServicosAtivos } from '../../../../db/queries/servicos'

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string }>
}) {
  const { cliente: clienteId } = await searchParams

  const [clientes, barbeiros, servicos] = await Promise.all([
    getClientesResumo(),
    getBarbeiros(),
    getServicosAtivos(),
  ])

  const clienteSelecionado = clienteId ? await getClienteComHistorico(clienteId) : null
  const nomeReferenciador = clienteSelecionado?.indicadoPor
    ? clientes.find((c) => c.id === clienteSelecionado.indicadoPor)?.nome
    : undefined

  return (
    <div>
      <SectionHeading action={<NovoClienteButton />}>Clientes</SectionHeading>

      <ClientesListClient clientes={clientes} />

      {clienteSelecionado && (
        <ClienteDetailDrawer
          cliente={clienteSelecionado}
          nomeReferenciador={nomeReferenciador}
          barbeiros={barbeiros}
          servicos={servicos}
        />
      )}
    </div>
  )
}
