import { Slider } from '../../components/ui'

interface CommissionSliderProps {
  value: number
  onChange: (percent: number) => void
}

export function CommissionSlider({ value, onChange }: CommissionSliderProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs text-text-secondary">Comissão</span>
        <span className="mono-value text-sm text-brass">{value}%</span>
      </div>
      <Slider
        min={20}
        max={70}
        step={1}
        value={value}
        aria-label="Percentual de comissão do barbeiro"
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="mt-1 flex justify-between text-[10px] text-text-secondary">
        <span>20%</span>
        <span>70%</span>
      </div>
    </div>
  )
}
