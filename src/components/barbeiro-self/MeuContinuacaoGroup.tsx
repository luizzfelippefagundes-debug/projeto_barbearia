import { CornerDownRight } from 'lucide-react'
import type { Agendamento } from '../../types'

/** Resumo em 1 linha de várias linhas de "continuação" seguidas (mesmo
 * agendamento longo ocupando vários slots de 15min) — ver ContinuacaoGroup
 * (versão admin) pra mais contexto. */
export function MeuContinuacaoGroup({ agendamentos }: { agendamentos: Agendamento[] }) {
  const primeiro = agendamentos[0].hora
  const ultimo = agendamentos[agendamentos.length - 1].hora

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3 text-text-secondary last:border-b-0">
      <span className="mono-value shrink-0 text-sm">
        {primeiro} – {ultimo}
      </span>
      <CornerDownRight size={14} className="shrink-0" aria-hidden="true" />
      <span className="text-xs">continuação do horário anterior</span>
    </div>
  )
}
