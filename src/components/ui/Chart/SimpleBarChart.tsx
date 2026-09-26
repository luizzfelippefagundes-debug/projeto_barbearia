'use client'

import { useState } from 'react'
import { formatBRL } from '../../../lib/format'

interface DataPoint {
  label: string
  value: number
  quantidade?: number
}

interface SimpleBarChartProps {
  data: DataPoint[]
  height?: number
  barColorClassName?: string
}

export function SimpleBarChart({
  data,
  height = 140,
  barColorClassName = 'bg-brass',
}: SimpleBarChartProps) {
  const [hoverLabel, setHoverLabel] = useState<string | null>(null)
  if (data.length === 0) return null
  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="flex w-full items-end gap-1 sm:gap-2" style={{ height }}>
      {data.map((d) => {
        const percent = (d.value / max) * 100
        const emHover = hoverLabel === d.label
        return (
          <div
            key={d.label}
            className="relative flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1 sm:gap-1.5"
            onMouseEnter={() => setHoverLabel(d.label)}
            onMouseLeave={() => setHoverLabel(null)}
          >
            {emHover && (
              <div className="pointer-events-none absolute -top-9 z-10 whitespace-nowrap rounded-md border border-border bg-surface px-2 py-1 text-xs shadow-sm">
                <span className="mono-value text-text-primary">{formatBRL(d.value)}</span>
                {d.quantidade !== undefined && <span className="text-text-secondary"> · {d.quantidade}x</span>}
              </div>
            )}
            <span className="mono-value w-full truncate text-center text-[10px] text-text-secondary sm:text-xs">
              {formatBRL(d.value)}
            </span>
            <div className="flex w-full flex-1 items-end">
              <div
                className={`w-full rounded-t transition-[filter] ${barColorClassName} ${emHover ? 'brightness-110' : ''}`}
                style={{ height: `${percent}%` }}
              />
            </div>
            <span className="w-full truncate text-center text-[10px] text-text-secondary sm:text-xs" title={d.label}>
              {d.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
