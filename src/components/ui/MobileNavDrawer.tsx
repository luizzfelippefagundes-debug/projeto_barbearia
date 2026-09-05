'use client'

import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface MobileNavDrawerProps {
  open: boolean
  onClose: () => void
  children: ReactNode
}

export function MobileNavDrawer({ open, onClose, children }: MobileNavDrawerProps) {
  useEffect(() => {
    if (!open) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex bg-black/50 lg:hidden"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="flex h-full w-72 max-w-[80%] flex-col border-r border-border bg-surface"
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}
