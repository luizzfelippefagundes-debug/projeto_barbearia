'use client'

import { useState, type MouseEvent } from 'react'
import { formatBRL } from '../../../lib/format'

interface DataPoint {
  label: string
  value: number
}

interface SimpleLineChartProps {
  data: DataPoint[]
  height?: number
  /** 'currency' (padrão) formata em R$; 'count' mostra o número puro —
   * usado pelo gráfico de novos assinantes por mês. */
  formatType?: 'currency' | 'count'
}

const WIDTH = 480

function formatValor(value: number, formatType: 'currency' | 'count'): string {
  return formatType === 'count' ? `${value}` : formatBRL(value)
}

export function SimpleLineChart({ data, height = 160, formatType = 'currency' }: SimpleLineChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  if (data.length === 0) return null

  const max = Math.max(...data.map((d) => d.value))
  const min = Math.min(0, ...data.map((d) => d.value))
  const range = max - min || 1

  const stepX = WIDTH / Math.max(1, data.length - 1)
  const points = data.map((d, i) => {
    const x = i * stepX
    const y = height - ((d.value - min) / range) * height
    return { x, y, ...d }
  })

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaD = `${pathD} L ${WIDTH} ${height} L 0 ${height} Z`

  function handleMouseMove(e: MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const relativeX = ((e.clientX - rect.left) / rect.width) * WIDTH
    let nearest = 0
    let menorDistancia = Infinity
    points.forEach((p, i) => {
      const distancia = Math.abs(p.x - relativeX)
      if (distancia < menorDistancia) {
        menorDistancia = distancia
        nearest = i
      }
    })
    setHoverIndex(nearest)
  }

  const hover = hoverIndex !== null ? points[hoverIndex] : null

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        className="w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label="Gráfico de previsão de faturamento"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <line x1={0} y1={height * 0.25} x2={WIDTH} y2={height * 0.25} stroke="var(--color-border)" strokeWidth={1} />
        <line x1={0} y1={height * 0.5} x2={WIDTH} y2={height * 0.5} stroke="var(--color-border)" strokeWidth={1} />
        <line x1={0} y1={height * 0.75} x2={WIDTH} y2={height * 0.75} stroke="var(--color-border)" strokeWidth={1} />
        <path d={areaD} fill="var(--color-accent-muted)" stroke="none" />
        <path d={pathD} fill="none" stroke="var(--color-accent)" strokeWidth={2} />
        {points.map((p) => (
          <circle key={p.label} cx={p.x} cy={p.y} r={3} fill="var(--color-accent)" />
        ))}
        {hover && (
          <>
            <line
              x1={hover.x}
              y1={0}
              x2={hover.x}
              y2={height}
              stroke="var(--color-accent)"
              strokeWidth={1}
              strokeDasharray="3,3"
              opacity={0.5}
            />
            <circle cx={hover.x} cy={hover.y} r={5} fill="var(--color-accent)" stroke="var(--color-surface)" strokeWidth={2} />
          </>
        )}
      </svg>
      {hover ? (
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border border-border bg-surface px-2 py-1 text-xs shadow-sm"
          style={{ left: `${(hover.x / WIDTH) * 100}%` }}
        >
          <span className="text-text-secondary">{hover.label}: </span>
          <span className="mono-value text-text-primary">{formatValor(hover.value, formatType)}</span>
        </div>
      ) : (
        <div className="mt-2 flex justify-between text-xs text-text-secondary">
          <span>{formatValor(data[0].value, formatType)}</span>
          <span>{formatValor(data[data.length - 1].value, formatType)}</span>
        </div>
      )}
    </div>
  )
}
