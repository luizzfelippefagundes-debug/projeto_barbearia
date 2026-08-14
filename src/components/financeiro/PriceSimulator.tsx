'use client'

import { useState } from 'react'
import type { Assinatura, PlanoAssinatura } from '../../types'
import { Card, Input, SectionHeading } from '../../components/ui'
import { getAssinantesEmDia, getMRR } from '../../lib/derive'
import { formatBRL } from '../../lib/format'

export function PriceSimulator({
  assinaturas,
  planos,
}: {
  assinaturas: Assinatura[]
  planos: PlanoAssinatura[]
}) {
  const mrrAtual = getMRR(assinaturas, planos)
  const assinantesEmDia = getAssinantesEmDia(assinaturas)
  const valorMedioAtual = assinantesEmDia > 0 ? mrrAtual / assinantesEmDia : 0

  const [novoValor, setNovoValor] = useState(Math.round(valorMedioAtual))

  const mrrEstimado = novoValor * assinantesEmDia
  const diferenca = mrrEstimado - mrrAtual

  return (
    <div>
      <SectionHeading>Simulador de mensalidade</SectionHeading>
      <Card className="p-5">
        <div className="mb-4 max-w-xs">
          <Input
            label="Novo valor médio de mensalidade"
            type="number"
            min={0}
            value={novoValor}
            onChange={(e) => setNovoValor(Number(e.target.value))}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-text-secondary">MRR atual</p>
            <p className="mono-value text-lg text-text-primary">{formatBRL(mrrAtual)}</p>
          </div>
          <div>
            <p className="text-xs text-text-secondary">
              MRR estimado ({assinantesEmDia} assinantes)
            </p>
            <p className="mono-value text-lg text-text-primary">{formatBRL(mrrEstimado)}</p>
          </div>
          <div>
            <p className="text-xs text-text-secondary">Impacto</p>
            <p className={`mono-value text-lg ${diferenca >= 0 ? 'text-status-green' : 'text-status-red'}`}>
              {diferenca >= 0 ? '+' : ''}
              {formatBRL(diferenca)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
