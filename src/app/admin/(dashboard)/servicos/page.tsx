import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button, Card, EmptyState, SectionHeading } from '../../../../components/ui'
import { ServicoRow } from '../../../../components/servicos/ServicoRow'
import { ServicoFormModal } from '../../../../components/servicos/ServicoFormModal'
import { PlanoResumoRow } from '../../../../components/servicos/PlanoResumoRow'
import { getServicos } from '../../../../db/queries/servicos'
import { getPlanosAssinatura } from '../../../../db/queries/assinaturas'

export default async function ServicosPage() {
  const [servicos, planos] = await Promise.all([getServicos(), getPlanosAssinatura()])

  return (
    <div className="flex flex-col gap-8">
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

      <div>
        <SectionHeading
          action={
            <Link href="/admin/assinaturas">
              <Button size="sm" variant="secondary">
                Gerenciar planos
                <ArrowRight size={14} aria-hidden="true" />
              </Button>
            </Link>
          }
        >
          Planos de assinatura
        </SectionHeading>
        {planos.length === 0 ? (
          <EmptyState
            title="Nenhum plano cadastrado"
            description="Crie o primeiro plano na aba Assinaturas."
          />
        ) : (
          <Card>
            {planos.map((plano) => (
              <PlanoResumoRow key={plano.id} plano={plano} />
            ))}
          </Card>
        )}
      </div>
    </div>
  )
}
