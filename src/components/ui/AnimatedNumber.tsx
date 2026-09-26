'use client'

import { useEffect, useState } from 'react'
import { formatBRL } from '../../lib/format'

const DURACAO_MS = 800

function formatValor(value: number, formatType: 'currency' | 'count'): string {
  return formatType === 'count' ? `${value}` : formatBRL(value)
}

/** Anima de 0 até o valor real toda vez que `value` muda (inclui o
 * carregamento inicial da página) — usado nos números de destaque do
 * dashboard. `formatType` (string, não função — Server Components não
 * podem passar funções pra Client Components) escolhe entre R$ ou
 * contagem simples. */
export function AnimatedNumber({
  value,
  formatType = 'currency',
}: {
  value: number
  formatType?: 'currency' | 'count'
}) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let frame: number
    const inicio = performance.now()

    function tick(agora: number) {
      const progresso = Math.min((agora - inicio) / DURACAO_MS, 1)
      const facilitado = 1 - Math.pow(1 - progresso, 3)
      setDisplay(Math.round(value * facilitado))
      if (progresso < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value])

  return <>{formatValor(display, formatType)}</>
}
