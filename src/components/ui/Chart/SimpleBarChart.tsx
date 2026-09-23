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
    <div className="flex w-full items-end gap-1 sm:gap-2" style={{ height }}>
      {data.map((d) => {
        const percent = (d.value / max) * 100
        return (
          <div key={d.label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1 sm:gap-1.5">
            <span className="mono-value w-full truncate text-center text-[10px] text-text-secondary sm:text-xs">
              {formatValue ? formatValue(d.value) : d.value}
            </span>
            <div className="flex w-full flex-1 items-end">
              <div
                className={`w-full rounded-t ${barColorClassName}`}
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
