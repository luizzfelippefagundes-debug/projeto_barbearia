import { useState } from 'react'
import type { Produto } from '../../types'
import { Button, Modal, Select, Input } from '../../components/ui'
import { useAppData } from '../../state/useAppData'

export function RegistrarVendaButton({ produto }: { produto: Produto }) {
  const { state, dispatch } = useAppData()
  const [open, setOpen] = useState(false)
  const [barbeiroId, setBarbeiroId] = useState(state.barbeiros[0]?.id ?? '')
  const [quantidade, setQuantidade] = useState(1)

  function handleConfirmar() {
    dispatch({
      type: 'REGISTRAR_VENDA',
      produtoId: produto.id,
      barbeiroId,
      quantidade,
    })
    setOpen(false)
    setQuantidade(1)
  }

  return (
    <>
      <Button size="sm" variant="secondary" disabled={produto.estoque === 0} onClick={() => setOpen(true)}>
        Registrar venda
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title={`Vender ${produto.nome}`}>
        <div className="flex flex-col gap-4">
          <Select
            label="Barbeiro que vendeu"
            value={barbeiroId}
            onChange={(e) => setBarbeiroId(e.target.value)}
          >
            {state.barbeiros.map((b) => (
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
            <Button onClick={handleConfirmar}>Confirmar venda</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
