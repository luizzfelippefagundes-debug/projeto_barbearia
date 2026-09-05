import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { Card } from '../../../../../components/ui'
import { AutoRefresh } from '../../../../../components/painel-ao-vivo/AutoRefresh'
import { PagamentoAssinaturaCard } from '../../../../../components/assinar/PagamentoAssinaturaCard'
import { requireClienteAtual } from '../../../../../lib/clienteAuth'
import { getAssinaturaPorId, getPlanosAssinatura } from '../../../../../db/queries/assinaturas'
import { verificarPagamentoAssinatura } from '../../../../../actions/assinar.actions'

export default async function PagarAssinaturaPage({
  params,
}: {
  params: Promise<{ assinaturaId: string }>
}) {
  const { assinaturaId } = await params
  const cliente = await requireClienteAtual()

  const assinatura = await getAssinaturaPorId(assinaturaId)
  if (!assinatura || assinatura.clienteId !== cliente.id) redirect('/cliente/assinar')

  const planos = await getPlanosAssinatura()
  const plano = planos.find((p) => p.id === assinatura.planoId)

  const statusAtual = await verificarPagamentoAssinatura(assinaturaId).catch(() => assinatura.status)

  if (statusAtual !== 'aguardando') {
    return (
      <div className="flex flex-col gap-4 lg:mx-auto lg:max-w-3xl">
        <Card className="flex flex-col items-center gap-3 p-6 text-center">
          <CheckCircle2 size={32} className="text-status-green" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-text-primary">Assinatura ativa</p>
            <p className="text-xs text-text-secondary">
              {plano ? `Plano ${plano.nome}` : 'Sua assinatura'} já está confirmada.
            </p>
          </div>
          <Link href="/cliente/perfil" className="text-xs text-accent underline">
            Ver meu perfil
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 lg:mx-auto lg:max-w-3xl">
      <AutoRefresh intervaloMs={5000} />

      <div>
        <h1 className="text-lg text-text-primary">Pagar assinatura</h1>
        <p className="text-sm text-text-secondary">
          {plano ? `Plano ${plano.nome}` : 'Finalize o pagamento via Pix ou cartão de crédito para ativar.'}
        </p>
      </div>

      <PagamentoAssinaturaCard assinaturaId={assinaturaId} valor={plano?.valorMensal ?? 0} />
    </div>
  )
}
