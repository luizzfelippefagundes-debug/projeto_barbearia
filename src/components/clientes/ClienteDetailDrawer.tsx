import Link from 'next/link'
import { X } from 'lucide-react'
import type { Barbeiro, Cliente, Servico } from '../../types'
import { Avatar } from '../../components/ui'
import { ClienteLoyaltyProgress } from './ClienteLoyaltyProgress'
import { ClienteReferralBadge } from './ClienteReferralBadge'
import { ClientePreferenceTags } from './ClientePreferenceTags'
import { ClienteHaircutGallery } from './ClienteHaircutGallery'
import { ClienteVisitHistory } from './ClienteVisitHistory'
import { ClienteNoteForm } from './ClienteNoteForm'

interface ClienteDetailDrawerProps {
  cliente: Cliente
  nomeReferenciador?: string
  barbeiros: Barbeiro[]
  servicos: Servico[]
}

export function ClienteDetailDrawer({
  cliente,
  nomeReferenciador,
  barbeiros,
  servicos,
}: ClienteDetailDrawerProps) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70">
      <Link
        href="/admin/clientes"
        aria-label="Fechar"
        className="absolute inset-0"
        tabIndex={-1}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Detalhes de ${cliente.nome}`}
        className="relative h-full w-full max-w-md overflow-y-auto border-l border-border bg-surface-raised p-6"
      >
        <div className="mb-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar nome={cliente.nome} src={cliente.avatarUrl} size="lg" />
            <div>
              <h2 className="text-lg text-text-primary">{cliente.nome}</h2>
              <p className="text-xs text-text-secondary">{cliente.telefone}</p>
              <ClienteReferralBadge nomeReferenciador={nomeReferenciador} />
            </div>
          </div>
          <Link
            href="/admin/clientes"
            aria-label="Fechar"
            className="flex h-9 w-9 items-center justify-center rounded border border-border text-text-secondary hover:border-brass hover:text-brass"
          >
            <X size={18} aria-hidden="true" />
          </Link>
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

          <ClienteNoteForm clienteId={cliente.id} barbeiros={barbeiros} servicos={servicos} />

          <div>
            <p className="mb-2 text-xs text-text-secondary">Histórico de atendimentos</p>
            <ClienteVisitHistory
              historico={cliente.historico}
              barbeiros={barbeiros}
              servicos={servicos}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
