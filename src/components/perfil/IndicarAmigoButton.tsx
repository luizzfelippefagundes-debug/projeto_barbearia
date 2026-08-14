'use client'

import { useState } from 'react'
import { Check, Copy, Gift } from 'lucide-react'
import { Button, Card } from '../../components/ui'

export function IndicarAmigoButton({ nome, totalIndicados }: { nome: string; totalIndicados: number }) {
  const [copiado, setCopiado] = useState(false)

  const codigo = `${nome.split(' ')[0]?.toUpperCase() ?? 'AMIGO'}10`
  const link = `barbearia.app/r/${codigo}`

  async function handleCopiar() {
    try {
      await navigator.clipboard.writeText(link)
    } catch {
      // ambiente sem permissão de clipboard — o código já fica visível na tela
    }
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center gap-2 text-brass">
        <Gift size={18} aria-hidden="true" />
        <span className="text-xs tracking-wide uppercase">Indique um amigo</span>
      </div>
      <p className="mb-3 text-sm text-text-secondary">
        Compartilhe seu link e ganhe desconto. Você já indicou {totalIndicados}{' '}
        {totalIndicados === 1 ? 'amigo' : 'amigos'}.
      </p>
      <div className="flex items-center gap-2">
        <span className="mono-value flex-1 truncate rounded border border-border bg-surface-raised px-3 py-2 text-sm text-text-primary">
          {link}
        </span>
        <Button size="sm" variant="secondary" onClick={handleCopiar}>
          {copiado ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
          {copiado ? 'Copiado' : 'Copiar'}
        </Button>
      </div>
    </Card>
  )
}
