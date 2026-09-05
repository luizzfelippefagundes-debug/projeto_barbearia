'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Card } from '../../components/ui'

export function PixPaymentCard({ encodedImage, payload }: { encodedImage: string; payload: string }) {
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(payload)
    } catch {
      // ambiente sem permissão de clipboard — o código continua visível pra copiar na mão
    }
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <Card className="flex flex-col items-center gap-4 p-6 text-center">
      <img
        src={`data:image/png;base64,${encodedImage}`}
        alt="QR code Pix"
        className="h-56 w-56 rounded-xl border border-border"
      />
      <button
        type="button"
        onClick={copiar}
        className="inline-flex items-center justify-center gap-2 rounded-full border border-accent bg-accent-muted px-5 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent-muted/70"
      >
        {copiado ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
        {copiado ? 'Copiado!' : 'Copiar código Pix'}
      </button>
      <p className="text-xs text-text-secondary">
        Abra o app do seu banco, escolha pagar com Pix e escaneie o QR ou cole o código copiado. Assim que
        confirmar, sua assinatura ativa sozinha.
      </p>
    </Card>
  )
}
