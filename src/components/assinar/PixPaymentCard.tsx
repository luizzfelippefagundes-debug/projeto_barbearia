'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button, Card } from '../../components/ui'
import { formatBRL } from '../../lib/format'

interface PixPaymentCardProps {
  encodedImage: string
  payload: string
  valor: number
}

export function PixPaymentCard({ encodedImage, payload, valor }: PixPaymentCardProps) {
  const [copiado, setCopiado] = useState(false)

  async function handleCopiar() {
    try {
      await navigator.clipboard.writeText(payload)
    } catch {
      // ambiente sem permissão de clipboard — o código já fica visível na tela
    }
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <Card className="flex flex-col items-center gap-4 p-6 text-center">
      <div>
        <p className="text-xs text-text-secondary">Valor a pagar</p>
        <p className="mono-value text-2xl text-accent">{formatBRL(valor)}</p>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element -- imagem base64 vinda direto do Asaas */}
      <img
        src={`data:image/png;base64,${encodedImage}`}
        alt="QR Code para pagamento via PIX"
        className="h-56 w-56 rounded-xl border border-border"
      />

      <div className="w-full">
        <p className="mb-1.5 text-xs text-text-secondary">Ou copie o código PIX</p>
        <div className="flex items-center gap-2">
          <span className="mono-value flex-1 truncate rounded-full border border-border bg-surface-raised px-3 py-2 text-xs text-text-primary">
            {payload}
          </span>
          <Button size="sm" variant="secondary" onClick={handleCopiar}>
            {copiado ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
            {copiado ? 'Copiado' : 'Copiar'}
          </Button>
        </div>
      </div>

      <p className="text-xs text-text-secondary">
        Assim que o pagamento for confirmado, sua assinatura fica ativa automaticamente.
      </p>
    </Card>
  )
}
