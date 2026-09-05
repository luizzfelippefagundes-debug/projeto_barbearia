'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Button, IconButton, Input, Modal } from '../../components/ui'
import { editarBarbeiro } from '../../actions/barbeiros.actions'

export function EditarBarbeiroButton({
  barbeiroId,
  nomeAtual,
  telefoneAtual,
}: {
  barbeiroId: string
  nomeAtual: string
  telefoneAtual?: string
}) {
  const [open, setOpen] = useState(false)
  const [nome, setNome] = useState(nomeAtual)
  const [telefone, setTelefone] = useState(telefoneAtual ?? '')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  function fechar() {
    setOpen(false)
    setNome(nomeAtual)
    setTelefone(telefoneAtual ?? '')
    setErro(null)
  }

  async function handleSalvar() {
    setSalvando(true)
    setErro(null)
    try {
      await editarBarbeiro(barbeiroId, nome, telefone)
      setOpen(false)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível salvar.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <>
      <IconButton icon={<Pencil size={14} aria-hidden="true" />} label="Editar barbeiro" onClick={() => setOpen(true)} />

      <Modal open={open} onClose={fechar} title="Editar barbeiro" widthClassName="max-w-sm">
        <div className="flex flex-col gap-4">
          <Input label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
          <Input
            label="Telefone (WhatsApp)"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="(11) 99999-9999"
          />
          <p className="-mt-2 text-xs text-text-secondary">
            Usado pelo bot do WhatsApp pra reconhecer que é a equipe falando, não cliente.
          </p>
          {erro && <p className="text-xs text-status-red">{erro}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={fechar}>
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
