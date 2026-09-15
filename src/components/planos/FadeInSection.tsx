'use client'

import { useEffect, useRef, useState } from 'react'

/** Anima a entrada de uma seção quando ela cruza a viewport ao rolar.
 * Tem um timeout de segurança de 1,2s pra garantir que o conteúdo sempre
 * aparece, mesmo se o IntersectionObserver nunca disparar por algum
 * motivo (ex: ferramenta de captura de tela que não rola a página de
 * verdade) — nunca deve ficar preso em opacity 0 pra sempre. Também
 * respeita prefers-reduced-motion, mostrando o conteúdo direto sem animar. */
export function FadeInSection({
  children,
  className,
  delayMs = 0,
}: {
  children: React.ReactNode
  className?: string
  delayMs?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visivel, setVisivel] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisivel(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisivel(true)
          observer.disconnect()
        }
      },
      { threshold: 0, rootMargin: '0px 0px 200px 0px' },
    )
    observer.observe(el)

    // Rede de segurança: se por qualquer motivo o observer nunca disparar
    // (ex: ferramenta de captura de tela que não rola a página de verdade),
    // o conteúdo aparece de qualquer jeito — nunca fica preso em opacity 0.
    const timeoutId = setTimeout(() => setVisivel(true), 1200)

    return () => {
      observer.disconnect()
      clearTimeout(timeoutId)
    }
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visivel ? 1 : 0,
        transform: visivel ? 'translateY(0)' : 'translateY(18px)',
        transition: `opacity 0.6s ease-out ${delayMs}ms, transform 0.6s ease-out ${delayMs}ms`,
      }}
    >
      {children}
    </div>
  )
}
