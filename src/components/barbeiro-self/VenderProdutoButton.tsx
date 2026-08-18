'use client'

import { useState } from 'react'
import type { Produto } from '../../types'
import { Button, Input, Modal } from '../../components/ui'
import { registrarMinhaVenda } from '../../actions/barbeiroSelf.actions'

export function VenderProdutoButton({ produto }: { produto: Produto }) {
  const [open, setOpen] = useState(false)
  const [quantidade, setQuantidade] = useState(1)
  const [salvando, setSalvando] = useState(false)

  async function handleConfirmar() {
    setSalvando(true)
    try {
      await registrarMinhaVenda(produto.id, quantidade)
      setOpen(false)
      setQuantidade(1)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <>
      <Button size="sm" variant="secondary" disabled={produto.estoque === 0} onClick={() => setOpen(true)}>
        Vender
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title={`Vender ${produto.nome}`}>
        <div className="flex flex-col gap-4">
          <Input
            label="Quantidade"
            type="number"
            min={1}
            max={produto.estoque}
            value={quantidade}
            onChange={(e) => setQuantidade(Math.max(1, Number(e.target.value)))}
          />
          <p className="text-xs text-text-secondary">{produto.estoque} em estoque</p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmar} disabled={salvando}>
              {salvando ? 'Salvando...' : 'Confirmar venda'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
