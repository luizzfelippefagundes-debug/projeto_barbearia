'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Button, IconButton, Input, Modal } from '../../components/ui'
import { atualizarMeuTelefone } from '../../actions/perfil.actions'

export function EditarMeuTelefoneButton({ telefoneAtual }: { telefoneAtual: string }) {
  const [open, setOpen] = useState(false)
  const [telefone, setTelefone] = useState(telefoneAtual)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  function fechar() {
    setOpen(false)
    setTelefone(telefoneAtual)
    setErro(null)
  }

  async function handleSalvar() {
    setSalvando(true)
    setErro(null)
    try {
      await atualizarMeuTelefone(telefone)
      setOpen(false)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível salvar.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <>
      <IconButton
        icon={<Pencil size={12} aria-hidden="true" />}
        label="Editar telefone"
        onClick={() => setOpen(true)}
      />

      <Modal open={open} onClose={fechar} title="Meu telefone" widthClassName="max-w-sm">
        <div className="flex flex-col gap-4">
          <Input
            label="Telefone (com DDD)"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="(11) 99999-9999"
          />
          <p className="-mt-2 text-xs text-text-secondary">
            Se você já marcou horário pelo WhatsApp com esse número antes de criar essa conta, seu histórico é
            trazido pra cá automaticamente.
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
