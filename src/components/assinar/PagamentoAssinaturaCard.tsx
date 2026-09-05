'use client'

import { useState } from 'react'
import { CreditCard, ExternalLink, QrCode } from 'lucide-react'
import { Button, Card } from '../../components/ui'
import { buscarLinkCartaoDaMinhaAssinatura, buscarPixDaMinhaAssinatura } from '../../actions/assinar.actions'
import { formatBRL } from '../../lib/format'
import { PixPaymentCard } from './PixPaymentCard'

interface PagamentoAssinaturaCardProps {
  assinaturaId: string
  valor: number
}

export function PagamentoAssinaturaCard({ assinaturaId, valor }: PagamentoAssinaturaCardProps) {
  const [carregando, setCarregando] = useState<'pix' | 'cartao' | null>(null)
  const [pix, setPix] = useState<{ encodedImage: string; payload: string } | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  async function pagarComPix() {
    setCarregando('pix')
    setErro(null)
    try {
      const dados = await buscarPixDaMinhaAssinatura(assinaturaId)
      setPix({ encodedImage: dados.encodedImage, payload: dados.payload })
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível gerar o Pix agora.')
    } finally {
      setCarregando(null)
    }
  }

  async function pagarComCartao() {
    setCarregando('cartao')
    setErro(null)
    try {
      const { invoiceUrl } = await buscarLinkCartaoDaMinhaAssinatura(assinaturaId)
      window.location.href = invoiceUrl
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível preparar o pagamento com cartão agora.')
      setCarregando(null)
    }
  }

  if (pix) return <PixPaymentCard encodedImage={pix.encodedImage} payload={pix.payload} />

  return (
    <Card className="flex flex-col items-center gap-4 p-6 text-center">
      <div>
        <p className="text-xs text-text-secondary">Valor a pagar</p>
        <p className="mono-value text-2xl text-accent">{formatBRL(valor)}</p>
      </div>

      <p className="text-sm text-text-secondary">Como você quer pagar?</p>

      <div className="flex w-full max-w-xs flex-col gap-2">
        <Button onClick={pagarComPix} disabled={carregando !== null}>
          <QrCode size={16} aria-hidden="true" />
          {carregando === 'pix' ? 'Gerando Pix...' : 'Pagar com Pix'}
        </Button>
        <Button variant="secondary" onClick={pagarComCartao} disabled={carregando !== null}>
          <CreditCard size={16} aria-hidden="true" />
          {carregando === 'cartao' ? 'Preparando...' : 'Pagar com cartão'}
          <ExternalLink size={14} aria-hidden="true" />
        </Button>
      </div>

      {erro && <p className="text-xs text-status-red">{erro}</p>}

      <p className="text-xs text-text-secondary">
        Assim que o pagamento for confirmado, sua assinatura fica ativa automaticamente.
      </p>
    </Card>
  )
}
