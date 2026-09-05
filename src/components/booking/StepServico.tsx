'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import type { Cliente, PlanoAssinatura, Servico } from '../../types'
import { Button, Card } from '../../components/ui'
import { formatBRL } from '../../lib/format'
import { getPrecoServicoParaCliente, getUsosServicoNoMes } from '../../lib/derive'
import { getHojeISO, mesReferenciaDeData } from '../../lib/dateUtils'
import { cn } from '../../lib/cn'

export function StepServico({
  servicos,
  cliente,
  assinanteAtivo,
  plano,
  onSelect,
}: {
  servicos: Servico[]
  cliente: Cliente
  assinanteAtivo: boolean
  plano?: PlanoAssinatura
  onSelect: (servicoIds: string[]) => void
}) {
  const mesReferencia = mesReferenciaDeData(getHojeISO())
  const [selecionados, setSelecionados] = useState<string[]>([])

  function toggle(servicoId: string) {
    setSelecionados((prev) =>
      prev.includes(servicoId) ? prev.filter((id) => id !== servicoId) : [...prev, servicoId],
    )
  }

  let duracaoTotal = 0
  let valorTotal = 0

  return (
    <div>
      <h2 className="mb-1 text-lg text-text-primary">Escolha o serviço</h2>
      <p className="mb-4 text-xs text-text-secondary">Pode escolher mais de um.</p>
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        {servicos.map((servico) => {
          const inclusao = plano?.servicosInclusos.find((i) => i.servicoId === servico.id)
          const usos = inclusao ? getUsosServicoNoMes(cliente, servico.id, mesReferencia) : 0
          const { valor, incluido, esgotado } = getPrecoServicoParaCliente(
            servico,
            assinanteAtivo,
            inclusao,
            usos,
          )
          const comDesconto = assinanteAtivo && !incluido && valor < servico.precoAvulso
          const restantes = inclusao?.limiteMensal != null ? Math.max(0, inclusao.limiteMensal - usos) : null
          const marcado = selecionados.includes(servico.id)
          if (marcado) {
            duracaoTotal += servico.duracaoMin
            valorTotal += valor
          }

          return (
            <button key={servico.id} type="button" onClick={() => toggle(servico.id)} className="text-left">
              <Card
                className={cn(
                  'flex items-center justify-between px-4 py-3 hover:border-brass',
                  marcado && 'border-brass',
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                      marcado ? 'border-brass bg-brass text-white' : 'border-border',
                    )}
                  >
                    {marcado && <Check size={12} aria-hidden="true" />}
                  </span>
                  <div>
                    <p className="text-sm text-text-primary">{servico.nome}</p>
                    <p className="text-xs text-text-secondary">{servico.duracaoMin} min</p>
                    {esgotado && (
                      <p className="text-xs text-status-amber">Limite do plano esgotado neste mês</p>
                    )}
                    {incluido && restantes !== null && (
                      <p className="text-xs text-text-secondary">{restantes} restante(s) este mês</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {incluido ? (
                    <span className="rounded-full bg-status-green-muted px-2 py-0.5 text-xs font-medium text-status-green">
                      Incluso no plano
                    </span>
                  ) : (
                    <>
                      {comDesconto && (
                        <span className="mono-value mr-1.5 text-xs text-text-secondary line-through">
                          {formatBRL(servico.precoAvulso)}
                        </span>
                      )}
                      <span className="mono-value text-sm text-brass">{formatBRL(valor)}</span>
                    </>
                  )}
                </div>
              </Card>
            </button>
          )
        })}
      </div>

      {selecionados.length > 0 && (
        <div className="sticky bottom-0 mt-4 flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3">
          <div>
            <p className="text-xs text-text-secondary">
              {selecionados.length} {selecionados.length === 1 ? 'serviço' : 'serviços'} · {duracaoTotal} min
            </p>
            <p className="mono-value text-sm text-text-primary">{formatBRL(valorTotal)}</p>
          </div>
          <Button size="sm" onClick={() => onSelect(selecionados)}>
            Continuar
          </Button>
        </div>
      )}
    </div>
  )
}
