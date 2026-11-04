import { CornerDownRight } from 'lucide-react'
import type { Agendamento, Barbeiro } from '../../types'

/** Resumo em 1 linha de várias linhas de "continuação" seguidas (mesmo
 * agendamento longo ocupando vários slots de 15min) — antes cada slot
 * virava uma linha idêntica, poluindo a agenda num serviço mais longo. */
export function ContinuacaoGroup({
  agendamentos,
  barbeiros,
  mostrarBarbeiro = true,
}: {
  agendamentos: Agendamento[]
  barbeiros: Barbeiro[]
  mostrarBarbeiro?: boolean
}) {
  const barbeiro = barbeiros.find((b) => b.id === agendamentos[0].barbeiroId)
  const primeiro = agendamentos[0].hora
  const ultimo = agendamentos[agendamentos.length - 1].hora
  const horaLabel = agendamentos.length === 1 ? primeiro : `${primeiro} – ${ultimo}`

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-l-2 border-b border-border border-l-transparent px-4 py-2.5 text-text-secondary last:border-b-0">
      <span className="mono-value shrink-0 text-sm">{horaLabel}</span>
      {mostrarBarbeiro && <span className="shrink-0 text-xs">{barbeiro?.nome}</span>}
      <span className="flex min-w-0 items-center gap-1 text-xs">
        <CornerDownRight size={14} className="shrink-0" aria-hidden="true" />
        continuação do horário anterior
      </span>
    </div>
  )
}
