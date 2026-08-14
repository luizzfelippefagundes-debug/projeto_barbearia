import { ChevronRight } from 'lucide-react'
import type { Cliente } from '../../types'
import { Avatar } from '../../components/ui'

interface ClienteListItemProps {
  cliente: Cliente
  onClick: () => void
}

export function ClienteListItem({ cliente, onClick }: ClienteListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 border-b border-border px-4 py-3 text-left last:border-b-0 hover:bg-surface-raised"
    >
      <div className="flex items-center gap-3">
        <Avatar nome={cliente.nome} src={cliente.avatarUrl} />
        <div>
          <p className="text-sm text-text-primary">{cliente.nome}</p>
          <p className="text-xs text-text-secondary">{cliente.telefone}</p>
        </div>
      </div>
      <ChevronRight size={16} className="text-text-secondary" aria-hidden="true" />
    </button>
  )
}
