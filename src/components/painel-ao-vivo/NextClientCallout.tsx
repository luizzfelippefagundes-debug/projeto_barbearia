import { Users } from 'lucide-react'
import type { Barbeiro, Cliente, FilaEsperaEntry } from '../../types'

export function NextClientCallout({
  filaEspera,
  clientes,
  barbeiros,
}: {
  filaEspera: FilaEsperaEntry[]
  clientes: Cliente[]
  barbeiros: Barbeiro[]
}) {
  const proximo = filaEspera.find((f) => !f.notificado)
  const cliente = proximo ? clientes.find((c) => c.id === proximo.clienteId) : undefined
  const barbeiroDesejado = proximo?.desejaBarbeiroId
    ? barbeiros.find((b) => b.id === proximo.desejaBarbeiroId)
    : undefined

  return (
    <div className="rounded-2xl border border-accent/40 bg-accent/15 p-6">
      <div className="mb-2 flex items-center gap-2 text-accent-hover">
        <Users size={20} aria-hidden="true" className="text-white" />
        <span className="font-heading text-sm font-bold tracking-wide text-white/70 uppercase">
          Próximo da fila
        </span>
      </div>
      {cliente ? (
        <>
          <p className="font-heading text-4xl font-bold text-white">{cliente.nome}</p>
          <p className="mt-1 text-lg text-white/60">
            {barbeiroDesejado ? barbeiroDesejado.nome : 'Qualquer barbeiro disponível'}
          </p>
        </>
      ) : (
        <p className="font-heading text-2xl font-bold text-white/50">Fila vazia</p>
      )}
    </div>
  )
}
