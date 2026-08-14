import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import type { Cliente } from '../../types'
import { Avatar, IconButton } from '../../components/ui'
import { ClienteLoyaltyProgress } from './ClienteLoyaltyProgress'
import { ClienteReferralBadge } from './ClienteReferralBadge'
import { ClientePreferenceTags } from './ClientePreferenceTags'
import { ClienteHaircutGallery } from './ClienteHaircutGallery'
import { ClienteVisitHistory } from './ClienteVisitHistory'
import { ClienteNoteForm } from './ClienteNoteForm'

interface ClienteDetailDrawerProps {
  cliente: Cliente | null
  onClose: () => void
}

export function ClienteDetailDrawer({ cliente, onClose }: ClienteDetailDrawerProps) {
  useEffect(() => {
    if (!cliente) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [cliente, onClose])

  if (!cliente) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/70"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Detalhes de ${cliente.nome}`}
        className="h-full w-full max-w-md overflow-y-auto border-l border-border bg-surface-raised p-6"
      >
        <div className="mb-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar nome={cliente.nome} src={cliente.avatarUrl} size="lg" />
            <div>
              <h2 className="text-lg text-text-primary">{cliente.nome}</h2>
              <p className="text-xs text-text-secondary">{cliente.telefone}</p>
              <ClienteReferralBadge indicadoPor={cliente.indicadoPor} />
            </div>
          </div>
          <IconButton icon={<X size={18} />} label="Fechar" onClick={onClose} />
        </div>

        <div className="flex flex-col gap-6">
          <ClienteLoyaltyProgress cliente={cliente} />

          <div>
            <p className="mb-2 text-xs text-text-secondary">Preferências</p>
            <ClientePreferenceTags tags={cliente.tags} />
          </div>

          <div>
            <p className="mb-2 text-xs text-text-secondary">Últimos cortes</p>
            <ClienteHaircutGallery historico={cliente.historico} />
          </div>

          <ClienteNoteForm clienteId={cliente.id} />

          <div>
            <p className="mb-2 text-xs text-text-secondary">Histórico de atendimentos</p>
            <ClienteVisitHistory historico={cliente.historico} />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
