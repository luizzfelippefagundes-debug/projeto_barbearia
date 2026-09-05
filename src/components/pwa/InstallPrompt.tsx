'use client'

import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

const DISMISSED_KEY = 'pwa-install-dismissed'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [modo, setModo] = useState<'android' | 'ios' | null>(null)

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISSED_KEY)) return
    } catch {
      // sem localStorage disponível — só não mostra o aviso, não quebra nada
      return
    }

    const jaInstalado =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true
    if (jaInstalado) return

    function handleBeforeInstall(e: Event) {
      e.preventDefault()
      setDeferredEvent(e as BeforeInstallPromptEvent)
      setModo('android')
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    const ua = navigator.userAgent
    const isIOS = /iphone|ipad|ipod/i.test(ua)
    const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua)
    if (isIOS && isSafari) setModo('ios')

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
  }, [])

  function dismiss() {
    setModo(null)
    try {
      localStorage.setItem(DISMISSED_KEY, '1')
    } catch {
      // sem localStorage — só fecha por essa sessão
    }
  }

  async function instalar() {
    if (!deferredEvent) return
    await deferredEvent.prompt()
    await deferredEvent.userChoice
    dismiss()
  }

  if (!modo) return null

  return (
    <div className="fixed inset-x-0 top-0 z-40 flex items-center gap-3 border-b border-border bg-surface px-4 py-2.5 text-sm shadow-sm">
      <Download size={16} className="shrink-0 text-accent" aria-hidden="true" />
      <p className="flex-1 text-text-primary">
        {modo === 'android'
          ? 'Instale o app na tela inicial do celular.'
          : 'Toque em Compartilhar e depois em "Adicionar à Tela de Início" pra instalar.'}
      </p>
      {modo === 'android' && (
        <button
          onClick={instalar}
          className="shrink-0 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-hover"
        >
          Instalar
        </button>
      )}
      <button
        onClick={dismiss}
        aria-label="Fechar aviso de instalação"
        className="shrink-0 text-text-secondary hover:text-text-primary"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  )
}
