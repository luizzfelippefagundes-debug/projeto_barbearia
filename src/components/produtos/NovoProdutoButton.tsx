'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button, Input, Modal } from '../../components/ui'
import { criarProduto } from '../../actions/produtos.actions'

export function NovoProdutoButton() {
  const [open, setOpen] = useState(false)
  const [nome, setNome] = useState('')
  const [preco, setPreco] = useState(0)
  const [estoque, setEstoque] = useState(0)
  const [estoqueMinimo, setEstoqueMinimo] = useState(5)
  const [categoria, setCategoria] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function handleSalvar() {
    if (!nome.trim()) {
      setErro('Digite o nome do produto.')
      return
    }
    setSalvando(true)
    setErro(null)
    try {
      await criarProduto(nome, preco, estoque, estoqueMinimo, categoria)
      setNome('')
      setPreco(0)
      setEstoque(0)
      setEstoqueMinimo(5)
      setCategoria('')
      setOpen(false)
    } catch {
      setErro('Não foi possível salvar. Tente de novo.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus size={16} aria-hidden="true" />
        Novo produto
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Novo produto">
        <div className="flex flex-col gap-4">
          <Input label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
          <Input
            label="Categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            placeholder="Ex: Finalização, Barba..."
          />
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Preço (R$)"
              type="number"
              min={0}
              step="0.01"
              value={preco}
              onChange={(e) => setPreco(Number(e.target.value))}
            />
            <Input
              label="Estoque"
              type="number"
              min={0}
              value={estoque}
              onChange={(e) => setEstoque(Number(e.target.value))}
            />
            <Input
              label="Estoque mín."
              type="number"
              min={0}
              value={estoqueMinimo}
              onChange={(e) => setEstoqueMinimo(Number(e.target.value))}
            />
          </div>
          {erro && <p className="text-xs text-status-red">{erro}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSalvar} disabled={salvando}>
              {salvando ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
