import { useMemo, useState } from 'react'
import { Card, SectionHeading } from '../../components/ui'
import { useAppData } from '../../state/useAppData'
import { ClienteSearchBar } from './ClienteSearchBar'
import { ClienteListItem } from './ClienteListItem'
import { ClienteDetailDrawer } from './ClienteDetailDrawer'

export function ClientesScreen() {
  const { state } = useAppData()
  const [busca, setBusca] = useState('')
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState<string | null>(null)

  const clientesFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return state.clientes
    return state.clientes.filter(
      (c) => c.nome.toLowerCase().includes(termo) || c.telefone.includes(termo),
    )
  }, [state.clientes, busca])

  const clienteSelecionado = state.clientes.find((c) => c.id === clienteSelecionadoId) ?? null

  return (
    <div>
      <SectionHeading>Clientes</SectionHeading>

      <div className="mb-4 max-w-sm">
        <ClienteSearchBar value={busca} onChange={setBusca} />
      </div>

      <Card>
        {clientesFiltrados.map((cliente) => (
          <ClienteListItem
            key={cliente.id}
            cliente={cliente}
            onClick={() => setClienteSelecionadoId(cliente.id)}
          />
        ))}
      </Card>

      <ClienteDetailDrawer cliente={clienteSelecionado} onClose={() => setClienteSelecionadoId(null)} />
    </div>
  )
}
