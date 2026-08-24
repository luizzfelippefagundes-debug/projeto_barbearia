import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CheckCircle2, Clock } from 'lucide-react'
import { Card } from '../../../../../components/ui'
import { AutoRefresh } from '../../../../../components/painel-ao-vivo/AutoRefresh'
import { PixPaymentCard } from '../../../../../components/assinar/PixPaymentCard'
import { requireClienteAtual } from '../../../../../lib/clienteAuth'
import { getAssinaturaPorId, getPlanosAssinatura } from '../../../../../db/queries/assinaturas'
import { buscarQrCodeDaMinhaAssinatura, verificarPagamentoAssinatura } from '../../../../../actions/assinar.actions'

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

  let qrCode: { encodedImage: string; payload: string } | null = null
  let erro: string | null = null
  try {
    qrCode = await buscarQrCodeDaMinhaAssinatura(assinaturaId)
  } catch (err) {
    erro = err instanceof Error ? err.message : 'Não foi possível carregar o PIX agora.'
  }

  return (
    <div className="flex flex-col gap-4 lg:mx-auto lg:max-w-3xl">
      <AutoRefresh intervaloMs={5000} />

      <div>
        <h1 className="text-lg text-text-primary">Pagar assinatura</h1>
        <p className="text-sm text-text-secondary">
          {plano ? `Plano ${plano.nome}` : 'Finalize o pagamento via PIX para ativar.'}
        </p>
      </div>

      {qrCode ? (
        <PixPaymentCard
          encodedImage={qrCode.encodedImage}
          payload={qrCode.payload}
          valor={plano?.valorMensal ?? 0}
        />
      ) : (
        <Card className="flex flex-col items-center gap-2 p-6 text-center">
          <Clock size={24} className="text-text-secondary" aria-hidden="true" />
          <p className="text-xs text-text-secondary">{erro ?? 'Gerando a cobrança PIX, aguarde...'}</p>
        </Card>
      )}
    </div>
  )
}
