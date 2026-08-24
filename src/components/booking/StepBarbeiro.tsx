import { Users } from 'lucide-react'
import type { Barbeiro } from '../../types'
import { Avatar, Card } from '../../components/ui'

export function StepBarbeiro({
  barbeiros,
  onSelect,
}: {
  barbeiros: Barbeiro[]
  onSelect: (barbeiroId: string | 'qualquer') => void
}) {
  return (
    <div>
      <h2 className="mb-4 text-lg text-text-primary">Escolha o barbeiro</h2>
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        <button type="button" onClick={() => onSelect('qualquer')} className="text-left">
          <Card className="flex items-center gap-3 px-4 py-3 hover:border-brass">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface-raised text-brass">
              <Users size={18} aria-hidden="true" />
            </span>
            <p className="text-sm text-text-primary">Qualquer um</p>
          </Card>
        </button>
        {barbeiros.map((barbeiro) => (
          <button key={barbeiro.id} type="button" onClick={() => onSelect(barbeiro.id)} className="text-left">
            <Card className="flex items-center gap-3 px-4 py-3 hover:border-brass">
              <Avatar nome={barbeiro.nome} src={barbeiro.avatarUrl} />
              <p className="text-sm text-text-primary">{barbeiro.nome}</p>
            </Card>
          </button>
        ))}
      </div>
    </div>
  )
}
