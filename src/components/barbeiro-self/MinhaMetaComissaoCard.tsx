'use client'

import { useState } from 'react'
import { Target } from 'lucide-react'
import { Button, Card, Input, ProgressBar } from '../../components/ui'
import { atualizarMinhaMetaComissao } from '../../actions/barbeiroSelf.actions'
import { formatBRL } from '../../lib/format'

export function MinhaMetaComissaoCard({
  valorAReceber,
  metaAtual,
}: {
  valorAReceber: number
  metaAtual: number | undefined
}) {
  const [editando, setEditando] = useState(false)
  const [valor, setValor] = useState(metaAtual ?? 0)
  const [salvando, setSalvando] = useState(false)

  async function handleSalvar() {
    setSalvando(true)
    try {
      await atualizarMinhaMetaComissao(valor)
      setEditando(false)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center gap-2 text-xs text-text-secondary">
        <Target size={14} aria-hidden="true" />
        Minha meta de comissão do mês
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
      ) : !metaAtual ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-secondary">Não definida</p>
          <Button size="sm" variant="ghost" onClick={() => setEditando(true)}>
            Definir meta
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="mono-value text-lg text-text-primary">
              {formatBRL(valorAReceber)} <span className="text-text-secondary">de {formatBRL(metaAtual)}</span>
            </p>
            <Button size="sm" variant="ghost" onClick={() => setEditando(true)}>
              Editar
            </Button>
          </div>
          <ProgressBar value={valorAReceber} max={metaAtual} label="Progresso da meta de comissão" />
        </div>
      )}
    </Card>
  )
}
