interface DataPoint {
  label: string
  value: number
}

interface SimpleLineChartProps {
  data: DataPoint[]
  height?: number
  formatValue?: (v: number) => string
}

const WIDTH = 480

export function SimpleLineChart({ data, height = 160, formatValue }: SimpleLineChartProps) {
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

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${WIDTH} ${height}`} className="w-full" preserveAspectRatio="none" role="img" aria-label="Gráfico de previsão de faturamento">
        <path d={areaD} fill="var(--color-accent-muted)" stroke="none" />
        <path d={pathD} fill="none" stroke="var(--color-accent)" strokeWidth={2} />
        {points.map((p) => (
          <circle key={p.label} cx={p.x} cy={p.y} r={3} fill="var(--color-accent)" />
        ))}
      </svg>
      <div className="mt-2 flex justify-between text-xs text-text-secondary">
        <span>{formatValue ? formatValue(data[0].value) : data[0].value}</span>
        <span>{formatValue ? formatValue(data[data.length - 1].value) : data[data.length - 1].value}</span>
      </div>
    </div>
  )
}
