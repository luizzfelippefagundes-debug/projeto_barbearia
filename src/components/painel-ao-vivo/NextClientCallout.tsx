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
    <div className="rounded border border-accent bg-accent-muted p-6">
      <div className="mb-2 flex items-center gap-2 text-accent">
        <Users size={20} aria-hidden="true" />
        <span className="font-heading text-sm tracking-widest uppercase">Próximo da fila</span>
      </div>
      {cliente ? (
        <>
          <p className="font-heading text-4xl tracking-wide text-text-primary uppercase">{cliente.nome}</p>
          <p className="mt-1 text-lg text-text-secondary">
            {barbeiroDesejado ? barbeiroDesejado.nome : 'Qualquer barbeiro disponível'}
          </p>
        </>
      ) : (
        <p className="font-heading text-2xl tracking-wide text-text-secondary uppercase">Fila vazia</p>
      )}
    </div>
  )
}
