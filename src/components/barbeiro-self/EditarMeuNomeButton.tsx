'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Button, IconButton, Input, Modal } from '../../components/ui'
import { atualizarMeuNome } from '../../actions/barbeiroSelf.actions'

export function EditarMeuNomeButton({ nomeAtual }: { nomeAtual: string }) {
  const [open, setOpen] = useState(false)
  const [nome, setNome] = useState(nomeAtual)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  function fechar() {
    setOpen(false)
    setNome(nomeAtual)
    setErro(null)
  }

  async function handleSalvar() {
    setSalvando(true)
    setErro(null)
    try {
      const resultado = await atualizarMeuNome(nome)
      if (resultado.error) {
        setErro(resultado.error)
        return
      }
      setOpen(false)
    } catch {
      setErro('Não foi possível salvar.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <>
      <IconButton icon={<Pencil size={14} aria-hidden="true" />} label="Editar meu nome" onClick={() => setOpen(true)} />

      <Modal open={open} onClose={fechar} title="Editar meu nome" widthClassName="max-w-sm">
        <div className="flex flex-col gap-4">
          <Input label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
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
