import { Card, EmptyState, SectionHeading } from '../../../../components/ui'
import { ServicoRow } from '../../../../components/servicos/ServicoRow'
import { ServicoFormModal } from '../../../../components/servicos/ServicoFormModal'
import { getServicos } from '../../../../db/queries/servicos'

export default async function ServicosPage() {
  const servicos = await getServicos()

  return (
    <div>
      <SectionHeading action={<ServicoFormModal />}>Serviços</SectionHeading>
      {servicos.length === 0 ? (
        <EmptyState
          title="Nenhum serviço cadastrado"
          description="Cadastre o primeiro serviço para o cliente conseguir agendar."
        />
      ) : (
        <Card>
          {servicos.map((servico) => (
            <ServicoRow key={servico.id} servico={servico} />
          ))}
        </Card>
      )}
    </div>
  )
}
