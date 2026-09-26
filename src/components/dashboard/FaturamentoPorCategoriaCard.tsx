'use client'

import { useState } from 'react'
import { Card, SectionHeading } from '../../components/ui'
import { formatBRL } from '../../lib/format'

interface Categoria {
  chave: string
  label: string
  valor: number
  corClassName: string
}

export function FaturamentoPorCategoriaCard({
  avulso,
  assinatura,
  produtos,
}: {
  avulso: number
  assinatura: number
  produtos: number
}) {
  const [hoverChave, setHoverChave] = useState<string | null>(null)
  const total = avulso + assinatura + produtos

  const categorias: Categoria[] = [
    { chave: 'avulso', label: 'Avulso', valor: avulso, corClassName: 'bg-accent' },
    { chave: 'assinatura', label: 'Assinaturas', valor: assinatura, corClassName: 'bg-chart-2' },
    { chave: 'produtos', label: 'Produtos', valor: produtos, corClassName: 'bg-chart-3' },
  ].filter((c) => c.valor > 0)

  return (
    <div>
      <SectionHeading>Faturamento por categoria este mês</SectionHeading>
      <Card className="flex flex-col gap-3 p-5">
        {total === 0 ? (
          <p className="text-sm text-text-secondary">Sem faturamento este mês ainda.</p>
        ) : (
          <>
            <div className="flex h-7 w-full overflow-hidden rounded-md">
              {categorias.map((c) => (
                <div
                  key={c.chave}
                  className={`relative flex items-center justify-center transition-[filter] ${c.corClassName} ${hoverChave === c.chave ? 'brightness-110' : ''}`}
                  style={{ width: `${(c.valor / total) * 100}%` }}
                  onMouseEnter={() => setHoverChave(c.chave)}
                  onMouseLeave={() => setHoverChave(null)}
                >
                  {hoverChave === c.chave && (
                    <div className="pointer-events-none absolute -top-9 z-10 whitespace-nowrap rounded-md border border-border bg-surface px-2 py-1 text-xs shadow-sm">
                      <span className="text-text-primary">{c.label}: </span>
                      <span className="mono-value text-text-primary">{formatBRL(c.valor)}</span>
                      <span className="text-text-secondary"> ({Math.round((c.valor / total) * 100)}%)</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              {categorias.map((c) => (
                <div key={c.chave} className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <span className={`h-2 w-2 rounded-sm ${c.corClassName}`} />
                  {c.label}
                  <span className="mono-value text-text-primary">{formatBRL(c.valor)}</span>
                  <span>({Math.round((c.valor / total) * 100)}%)</span>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
