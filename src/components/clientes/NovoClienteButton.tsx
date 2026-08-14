'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button, Input, Modal } from '../../components/ui'
import { criarCliente } from '../../actions/clientes.actions'

export function NovoClienteButton() {
  const [open, setOpen] = useState(false)
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function handleSalvar() {
    if (!nome.trim()) {
      setErro('Digite o nome do cliente.')
      return
    }
    setSalvando(true)
    setErro(null)
    try {
      await criarCliente(nome, telefone)
      setNome('')
      setTelefone('')
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
        Novo cliente
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Novo cliente">
        <div className="flex flex-col gap-4">
          <Input label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
          <Input
            label="Telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="(11) 99999-9999"
          />
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
