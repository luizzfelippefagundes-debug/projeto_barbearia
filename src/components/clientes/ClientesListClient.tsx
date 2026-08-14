'use client'

import { useMemo, useState } from 'react'
import type { Cliente } from '../../types'
import { Card, EmptyState, SearchInput } from '../../components/ui'
import { ClienteListItem } from './ClienteListItem'

export function ClientesListClient({ clientes }: { clientes: Cliente[] }) {
  const [busca, setBusca] = useState('')

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return clientes
    return clientes.filter(
      (c) => c.nome.toLowerCase().includes(termo) || c.telefone.includes(termo),
    )
  }, [clientes, busca])

  return (
    <div>
      <div className="mb-4 max-w-sm">
        <SearchInput
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou telefone..."
          aria-label="Buscar cliente"
        />
      </div>

      {filtrados.length === 0 ? (
        <EmptyState title="Nenhum cliente encontrado" description="Tente outro nome ou telefone." />
      ) : (
        <Card>
          {filtrados.map((cliente) => (
            <ClienteListItem key={cliente.id} cliente={cliente} />
          ))}
        </Card>
      )}
    </div>
  )
}
