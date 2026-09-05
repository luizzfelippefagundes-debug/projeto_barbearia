import { Users } from 'lucide-react'
import type { Barbeiro } from '../../types'
import { Card } from '../../components/ui'

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/)
  const primeira = partes[0]?.[0] ?? ''
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : ''
  return (primeira + ultima).toUpperCase()
}

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
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <button type="button" onClick={() => onSelect('qualquer')} className="text-left">
          <Card className="overflow-hidden p-0 hover:border-brass">
            <div className="flex aspect-square w-full items-center justify-center bg-surface-raised text-brass">
              <Users size={40} aria-hidden="true" />
            </div>
            <p className="px-2 py-2.5 text-center text-sm text-text-primary">Qualquer um</p>
          </Card>
        </button>
        {barbeiros.map((barbeiro) => (
          <button key={barbeiro.id} type="button" onClick={() => onSelect(barbeiro.id)} className="text-left">
            <Card className="overflow-hidden p-0 hover:border-brass">
              <div className="aspect-square w-full bg-accent-muted">
                {barbeiro.avatarUrl ? (
                  <img src={barbeiro.avatarUrl} alt={barbeiro.nome} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-heading text-3xl font-bold text-accent">
                    {iniciais(barbeiro.nome)}
                  </div>
                )}
              </div>
              <p className="px-2 py-2.5 text-center text-sm text-text-primary">{barbeiro.nome}</p>
            </Card>
          </button>
        ))}
      </div>
    </div>
  )
}
