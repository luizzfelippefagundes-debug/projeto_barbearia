'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** Tela de TV sem interação humana — precisa se atualizar sozinha. */
export function AutoRefresh({ intervaloMs = 45_000 }: { intervaloMs?: number }) {
  const router = useRouter()

  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervaloMs)
    return () => clearInterval(id)
  }, [router, intervaloMs])

  return null
}
