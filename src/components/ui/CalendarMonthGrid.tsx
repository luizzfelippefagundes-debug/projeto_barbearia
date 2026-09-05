'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MESES } from '../../lib/dateUtils'
import { cn } from '../../lib/cn'

const DIAS_SEMANA_HEADER = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

function ultimoDiaDoMes(ano: number, mes: number): number {
  return new Date(ano, mes + 1, 0).getDate()
}

function paraISO(ano: number, mes: number, dia: number): string {
  return `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
}

/** Grade de calendário reutilizável — mês exibido navegável por setas,
 * dias fora de [minData, maxData] (quando informados) ficam desabilitados. */
export function CalendarMonthGrid({
  selecionado,
  minData,
  maxData,
  onSelect,
}: {
  selecionado: string
  minData?: string
  maxData?: string
  onSelect: (diaISO: string) => void
}) {
  const [anoInicial, mesInicial] = selecionado.split('-').map(Number)
  const [mesExibido, setMesExibido] = useState({ ano: anoInicial, mes: mesInicial - 1 })

  const chaveMesExibido = mesExibido.ano * 12 + mesExibido.mes
  const chaveMin = minData ? (() => {
    const [a, m] = minData.split('-').map(Number)
    return a * 12 + (m - 1)
  })() : null
  const chaveMax = maxData ? (() => {
    const [a, m] = maxData.split('-').map(Number)
    return a * 12 + (m - 1)
  })() : null

  const podeVoltarMes = chaveMin === null || chaveMesExibido > chaveMin
  const podeAvancarMes = chaveMax === null || chaveMesExibido < chaveMax

  const primeiroDiaSemana = new Date(mesExibido.ano, mesExibido.mes, 1).getDay()
  const totalDias = ultimoDiaDoMes(mesExibido.ano, mesExibido.mes)

  const celulas: (string | null)[] = [
    ...Array.from({ length: primeiroDiaSemana }, () => null),
    ...Array.from({ length: totalDias }, (_, i) => paraISO(mesExibido.ano, mesExibido.mes, i + 1)),
  ]

  function mudarMes(delta: number) {
    setMesExibido((m) => {
      const total = m.ano * 12 + m.mes + delta
      return { ano: Math.floor(total / 12), mes: ((total % 12) + 12) % 12 }
    })
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          disabled={!podeVoltarMes}
          onClick={() => mudarMes(-1)}
          aria-label="Mês anterior"
          className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <p className="text-sm font-semibold text-text-primary capitalize">
          {MESES[mesExibido.mes]} {mesExibido.ano}
        </p>
        <button
          type="button"
          disabled={!podeAvancarMes}
          onClick={() => mudarMes(1)}
          aria-label="Próximo mês"
          className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-xs text-text-secondary">
        {DIAS_SEMANA_HEADER.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {celulas.map((dia, i) => {
          if (!dia) return <span key={`vazio-${i}`} />
          const habilitado = (!minData || dia >= minData) && (!maxData || dia <= maxData)
          const ativo = dia === selecionado
          return (
            <button
              key={dia}
              type="button"
              disabled={!habilitado}
              onClick={() => onSelect(dia)}
              className={cn(
                'mono-value h-9 rounded-full text-sm transition-colors',
                ativo && 'bg-accent text-white',
                !ativo && habilitado && 'text-text-primary hover:bg-surface-raised',
                !habilitado && 'cursor-not-allowed text-text-secondary/30',
              )}
            >
              {Number(dia.slice(8, 10))}
            </button>
          )
        })}
      </div>
    </div>
  )
}
