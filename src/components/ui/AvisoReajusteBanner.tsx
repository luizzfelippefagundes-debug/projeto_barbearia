'use client'

import { useEffect, useState } from 'react'
import { Megaphone, X } from 'lucide-react'

/** AVISO TEMPORÁRIO DE REAJUSTE — banner dispensável exibido na área do
 * cliente. Para remover o comunicado, apague este componente e os lugares
 * que o importam (home do cliente e tela de agendar). Trocar a VERSAO faz o
 * banner reaparecer pra quem já tinha dispensado. */
const VERSAO = 'reajuste-2026-11'
const STORAGE_KEY = `aviso-dispensado:${VERSAO}`

export function AvisoReajusteBanner() {
  const [visivel, setVisivel] = useState(false)

  useEffect(() => {
    try {
      setVisivel(localStorage.getItem(STORAGE_KEY) !== '1')
    } catch {
      setVisivel(true)
    }
  }, [])

  if (!visivel) return null

  function dispensar() {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // sem localStorage (aba privada) — só esconde nesta sessão
    }
    setVisivel(false)
  }

  return (
    <div className="relative mb-4 rounded-xl border border-accent/30 bg-accent-muted p-4">
      <button
        type="button"
        onClick={dispensar}
        aria-label="Dispensar aviso"
        className="absolute right-3 top-3 text-text-secondary transition-colors hover:text-text-primary"
      >
        <X size={16} aria-hidden="true" />
      </button>
      <div className="flex items-start gap-3 pr-6">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
          <Megaphone size={16} aria-hidden="true" />
        </span>
        <div className="text-sm text-text-primary">
          <p className="font-semibold">Novos valores dos planos</p>
          <p className="mt-1 text-text-secondary">
            Os planos foram reajustados: <strong className="text-text-primary">Cabelo R$ 79,90/mês</strong> e{' '}
            <strong className="text-text-primary">Cabelo, Barba e Pezinho R$ 136,90/mês</strong>. Quem já é assinante
            continua no valor antigo até a próxima cobrança.
          </p>
        </div>
      </div>
    </div>
  )
}
