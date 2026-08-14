'use client'

import { useState } from 'react'
import { Target } from 'lucide-react'
import { Button, Card, Input } from '../../components/ui'
import { setMetaFaturamento } from '../../actions/configuracoes.actions'
import { formatBRL } from '../../lib/format'

export function MetaFaturamentoCard({ metaAtual }: { metaAtual: number | null }) {
  const [editando, setEditando] = useState(false)
  const [valor, setValor] = useState(metaAtual ?? 0)
  const [salvando, setSalvando] = useState(false)

  async function handleSalvar() {
    setSalvando(true)
    try {
      await setMetaFaturamento(valor)
      setEditando(false)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Card className="p-4">
      <div className="mb-1 flex items-center gap-2 text-xs text-text-secondary">
        <Target size={14} aria-hidden="true" />
        Meta de faturamento do mês
      </div>
      {editando ? (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            value={valor}
            onChange={(e) => setValor(Number(e.target.value))}
            className="max-w-[10rem]"
          />
          <Button size="sm" onClick={handleSalvar} disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="mono-value text-2xl text-text-primary">
            {metaAtual ? formatBRL(metaAtual) : 'Não definida'}
          </p>
          <Button size="sm" variant="ghost" onClick={() => setEditando(true)}>
            Editar
          </Button>
        </div>
      )}
    </Card>
  )
}
