'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button, Card } from '../../components/ui'

export function LinkCopyCard({ titulo, descricao, link }: { titulo: string; descricao: string; link: string }) {
  const [copiado, setCopiado] = useState(false)

  async function handleCopiar() {
    try {
      await navigator.clipboard.writeText(link)
    } catch {
      // ambiente sem permissão de clipboard — o link já fica visível na tela
    }
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <Card className="p-4">
      <p className="mb-1 text-sm font-semibold text-text-primary">{titulo}</p>
      <p className="mb-3 text-xs text-text-secondary">{descricao}</p>
      <div className="flex items-center gap-2">
        <span className="mono-value flex-1 truncate rounded border border-border bg-surface-raised px-3 py-2 text-xs text-text-primary">
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
