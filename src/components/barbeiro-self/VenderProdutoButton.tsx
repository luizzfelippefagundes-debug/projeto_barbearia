'use client'

import { useState } from 'react'
import type { Produto } from '../../types'
import { Button, Input, Modal } from '../../components/ui'
import { registrarMinhaVenda } from '../../actions/barbeiroSelf.actions'

export function VenderProdutoButton({ produto }: { produto: Produto }) {
  const [open, setOpen] = useState(false)
  const [quantidade, setQuantidade] = useState(1)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function handleConfirmar() {
    setSalvando(true)
    setErro(null)
    try {
      const resultado = await registrarMinhaVenda(produto.id, quantidade)
      if (resultado.error) {
        setErro(resultado.error)
        return
      }
      setOpen(false)
      setQuantidade(1)
    } catch {
      setErro('Não foi possível registrar a venda.')
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
          {erro && <p className="text-xs text-status-red">{erro}</p>}
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
