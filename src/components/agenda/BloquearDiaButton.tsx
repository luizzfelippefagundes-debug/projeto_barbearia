'use client'

import { useState } from 'react'
import { CalendarOff } from 'lucide-react'
import type { Barbeiro } from '../../types'
import { Button, Modal, Select } from '../../components/ui'
import { bloquearDiaInteiro, desbloquearDiaInteiro } from '../../actions/agenda.actions'

const TODOS = 'todos'

export function BloquearDiaButton({ dataISO, barbeiros }: { dataISO: string; barbeiros: Barbeiro[] }) {
  const [open, setOpen] = useState(false)
  const [barbeiroId, setBarbeiroId] = useState(TODOS)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const alvo = barbeiroId === TODOS ? barbeiros.map((b) => b.id) : [barbeiroId]

  async function executar(acao: (data: string, barbeiroId: string) => Promise<void>) {
    setSalvando(true)
    setErro(null)
    try {
      for (const id of alvo) {
        await acao(dataISO, id)
      }
      setOpen(false)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível atualizar.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <>
      <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
        <CalendarOff size={16} aria-hidden="true" />
        Bloquear dia
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Bloquear dia inteiro">
        <div className="flex flex-col gap-4">
          <Select label="Barbeiro" value={barbeiroId} onChange={(e) => setBarbeiroId(e.target.value)}>
            <option value={TODOS}>Todos os barbeiros</option>
            {barbeiros.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nome}
              </option>
            ))}
          </Select>
          <p className="text-xs text-text-secondary">
            Bloqueia todos os horários livres desse dia. Horários que já têm cliente marcado não são mexidos.
          </p>
          {erro && <p className="text-xs text-status-red">{erro}</p>}
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button variant="secondary" disabled={salvando} onClick={() => executar(desbloquearDiaInteiro)}>
              Desbloquear dia
            </Button>
            <Button disabled={salvando} onClick={() => executar(bloquearDiaInteiro)}>
              {salvando ? 'Salvando...' : 'Bloquear dia'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
