interface DataPoint {
  label: string
  value: number
}

interface SimpleBarChartProps {
  data: DataPoint[]
  height?: number
  formatValue?: (v: number) => string
  barColorClassName?: string
}

export function SimpleBarChart({
  data,
  height = 140,
  formatValue,
  barColorClassName = 'bg-brass',
}: SimpleBarChartProps) {
  if (data.length === 0) return null
  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="flex w-full items-end gap-2" style={{ height }}>
      {data.map((d) => {
        const percent = (d.value / max) * 100
        return (
          <div key={d.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <span className="mono-value text-xs text-text-secondary">
              {formatValue ? formatValue(d.value) : d.value}
            </span>
            <div className="flex w-full flex-1 items-end">
              <div
                className={`w-full rounded-t ${barColorClassName}`}
                style={{ height: `${percent}%` }}
              />
            </div>
            <span className="text-xs text-text-secondary">{d.label}</span>
          </div>
        )
      })}
    </div>
  )
}
