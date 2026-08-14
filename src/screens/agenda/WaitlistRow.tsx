import { BellRing, Check } from 'lucide-react'
import type { FilaEsperaEntry } from '../../types'
import { Button } from '../../components/ui'
import { useAppData } from '../../state/useAppData'

export function WaitlistRow({ entrada }: { entrada: FilaEsperaEntry }) {
  const { state, dispatch } = useAppData()

  const cliente = state.clientes.find((c) => c.id === entrada.clienteId)
  const barbeiroDesejado = entrada.desejaBarbeiroId
    ? state.barbeiros.find((b) => b.id === entrada.desejaBarbeiroId)
    : undefined
  const servicoDesejado = entrada.desejaServicoId
    ? state.servicos.find((s) => s.id === entrada.desejaServicoId)
    : undefined

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2.5 last:border-b-0">
      <div>
        <p className="text-sm text-text-primary">{cliente?.nome}</p>
        <p className="text-xs text-text-secondary">
          {barbeiroDesejado ? barbeiroDesejado.nome : 'Qualquer barbeiro'}
          {servicoDesejado ? ` · ${servicoDesejado.nome}` : ''}
        </p>
      </div>

      {entrada.notificado ? (
        <span className="flex items-center gap-1.5 text-xs text-status-green">
          <Check size={14} aria-hidden="true" /> Notificado
        </span>
      ) : (
        <Button size="sm" variant="secondary" onClick={() => dispatch({ type: 'NOTIFICAR_FILA', filaId: entrada.id })}>
          <BellRing size={14} aria-hidden="true" />
          Notificar
        </Button>
      )}
    </div>
  )
}
