'use client'

import { useState } from 'react'
import { CreditCard, QrCode } from 'lucide-react'
import { Button, Card } from '../../components/ui'
import { buscarPixDaMinhaAssinatura } from '../../actions/assinar.actions'
import { formatBRL } from '../../lib/format'
import { CartaoForm } from './CartaoForm'
import { PixPaymentCard } from './PixPaymentCard'

interface PagamentoAssinaturaCardProps {
  assinaturaId: string
  valor: number
  cpf?: string
  telefone?: string
}

export function PagamentoAssinaturaCard({ assinaturaId, valor, cpf, telefone }: PagamentoAssinaturaCardProps) {
  const [carregandoPix, setCarregandoPix] = useState(false)
  const [pix, setPix] = useState<{ encodedImage: string; payload: string } | null>(null)
  const [mostrarCartao, setMostrarCartao] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function pagarComPix() {
    setCarregandoPix(true)
    setErro(null)
    try {
      const dados = await buscarPixDaMinhaAssinatura(assinaturaId)
      if ('error' in dados) {
        setErro(dados.error)
        return
      }
      setPix({ encodedImage: dados.encodedImage, payload: dados.payload })
    } catch {
      setErro('Não foi possível gerar o Pix agora.')
    } finally {
      setCarregandoPix(false)
    }
  }

  if (pix) return <PixPaymentCard encodedImage={pix.encodedImage} payload={pix.payload} />

  return (
    <Card className="flex flex-col items-center gap-4 p-6 text-center">
      <div>
        <p className="text-xs text-text-secondary">Valor a pagar</p>
        <p className="mono-value text-2xl text-accent">{formatBRL(valor)}</p>
      </div>

      {mostrarCartao ? (
        <CartaoForm
          assinaturaId={assinaturaId}
          valor={valor}
          cpfInicial={cpf}
          telefoneInicial={telefone}
          onVoltar={() => setMostrarCartao(false)}
        />
      ) : (
        <>
          <p className="text-sm text-text-secondary">Como você quer pagar?</p>

          <div className="flex w-full max-w-xs flex-col gap-2">
            <Button onClick={pagarComPix} disabled={carregandoPix}>
              <QrCode size={16} aria-hidden="true" />
              {carregandoPix ? 'Gerando Pix...' : 'Pagar com Pix'}
            </Button>
            <Button variant="secondary" onClick={() => setMostrarCartao(true)} disabled={carregandoPix}>
              <CreditCard size={16} aria-hidden="true" />
              Pagar com cartão
            </Button>
          </div>

          {erro && <p className="text-xs text-status-red">{erro}</p>}

          <p className="text-xs text-text-secondary">
            No cartão, os próximos meses são cobrados automaticamente. No Pix, você paga todo mês por aqui.
          </p>
        </>
      )}
    </Card>
  )
}
