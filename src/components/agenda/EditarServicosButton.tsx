'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import type { Servico } from '../../types'
import { Button, IconButton, Modal } from '../../components/ui'
import { editarServicosAgendamento } from '../../actions/agenda.actions'

export function EditarServicosButton({
  agendamentoId,
  servicos,
  servicoIdsAtuais,
}: {
  agendamentoId: string
  servicos: Servico[]
  servicoIdsAtuais: string[]
}) {
  const [open, setOpen] = useState(false)
  const [servicoIds, setServicoIds] = useState(servicoIdsAtuais)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  function fechar() {
    setOpen(false)
    setServicoIds(servicoIdsAtuais)
    setErro(null)
  }

  function toggleServico(servicoId: string) {
    setServicoIds((prev) => (prev.includes(servicoId) ? prev.filter((id) => id !== servicoId) : [...prev, servicoId]))
  }

  async function handleSalvar() {
    if (servicoIds.length === 0) {
      setErro('Escolha pelo menos um serviço.')
      return
    }
    setSalvando(true)
    setErro(null)
    try {
      await editarServicosAgendamento(agendamentoId, servicoIds)
      setOpen(false)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível salvar.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <>
      <IconButton icon={<Pencil size={14} aria-hidden="true" />} label="Editar serviços" onClick={() => setOpen(true)} />

      <Modal open={open} onClose={fechar} title="Editar serviços" widthClassName="max-w-sm">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            {servicos.map((s) => (
              <label
                key={s.id}
                className="flex items-center gap-2 rounded-xl border border-border p-2.5 text-sm text-text-primary"
              >
                <input
                  type="checkbox"
                  checked={servicoIds.includes(s.id)}
                  onChange={() => toggleServico(s.id)}
                  className="h-4 w-4 rounded border-border"
                />
                {s.nome}
              </label>
            ))}
          </div>
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
