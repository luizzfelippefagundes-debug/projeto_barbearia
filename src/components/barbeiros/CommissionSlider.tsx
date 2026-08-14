'use client'

import { useState, useTransition } from 'react'
import { Slider } from '../../components/ui'
import { setComissao } from '../../actions/barbeiros.actions'

interface CommissionSliderProps {
  barbeiroId: string
  value: number
}

export function CommissionSlider({ barbeiroId, value }: CommissionSliderProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const [, startTransition] = useTransition()

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs text-text-secondary">Comissão</span>
        <span className="mono-value text-sm text-brass">{displayValue}%</span>
      </div>
      <Slider
        min={20}
        max={70}
        step={1}
        value={displayValue}
        aria-label="Percentual de comissão do barbeiro"
        onInput={(e) => setDisplayValue(Number((e.target as HTMLInputElement).value))}
        onChange={(e) => {
          const percent = Number(e.target.value)
          setDisplayValue(percent)
          startTransition(() => {
            setComissao(barbeiroId, percent)
          })
        }}
      />
      <div className="mt-1 flex justify-between text-[10px] text-text-secondary">
        <span>20%</span>
        <span>70%</span>
      </div>
    </div>
  )
}
