'use client'

import { useState } from 'react'
import type { Barbeiro, Produto } from '../../types'
import { Button, Modal, Select, Input } from '../../components/ui'
import { registrarVenda } from '../../actions/produtos.actions'

export function RegistrarVendaButton({
  produto,
  barbeiros,
}: {
  produto: Produto
  barbeiros: Barbeiro[]
}) {
  const [open, setOpen] = useState(false)
  const [barbeiroId, setBarbeiroId] = useState(barbeiros[0]?.id ?? '')
  const [quantidade, setQuantidade] = useState(1)
  const [salvando, setSalvando] = useState(false)

  async function handleConfirmar() {
    if (!barbeiroId) return
    setSalvando(true)
    try {
      await registrarVenda(produto.id, barbeiroId, quantidade)
      setOpen(false)
      setQuantidade(1)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <>
      <Button
        size="sm"
        variant="secondary"
        disabled={produto.estoque === 0 || barbeiros.length === 0}
        onClick={() => setOpen(true)}
      >
        Registrar venda
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title={`Vender ${produto.nome}`}>
        <div className="flex flex-col gap-4">
          <Select
            label="Barbeiro que vendeu"
            value={barbeiroId}
            onChange={(e) => setBarbeiroId(e.target.value)}
          >
            {barbeiros.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nome}
              </option>
            ))}
          </Select>

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
