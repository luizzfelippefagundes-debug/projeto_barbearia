'use client'

import { useEffect, useState } from 'react'

const DURACAO_MS = 800

/** Anima de 0 até o valor real toda vez que `value` muda (inclui o
 * carregamento inicial da página) — usado nos números de destaque do
 * dashboard. `format` formata o valor arredondado em cada frame (ex:
 * formatBRL, ou String pra contagem simples). */
export function AnimatedNumber({
  value,
  format,
}: {
  value: number
  format: (v: number) => string
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

  return <>{format(display)}</>
}
