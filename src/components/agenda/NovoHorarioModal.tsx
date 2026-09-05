'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { Barbeiro, Cliente, Servico } from '../../types'
import { Button, Modal, Select, EmptyState } from '../../components/ui'
import { criarOuAtualizarHorario } from '../../actions/agenda.actions'
import { TIME_SLOTS } from '../../lib/dateUtils'

interface NovoHorarioModalProps {
  dataISO: string
  barbeiros: Barbeiro[]
  clientes: Cliente[]
  servicos: Servico[]
}

export function NovoHorarioModal({ dataISO, barbeiros, clientes, servicos }: NovoHorarioModalProps) {
  const [open, setOpen] = useState(false)
  const [barbeiroId, setBarbeiroId] = useState(barbeiros[0]?.id ?? '')
  const [hora, setHora] = useState(TIME_SLOTS[0])
  const [clienteId, setClienteId] = useState(clientes[0]?.id ?? '')
  const [servicoIds, setServicoIds] = useState<string[]>(servicos[0] ? [servicos[0].id] : [])
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const podeSalvar = barbeiros.length > 0 && clientes.length > 0 && servicos.length > 0

  function toggleServico(servicoId: string) {
    setServicoIds((prev) =>
      prev.includes(servicoId) ? prev.filter((id) => id !== servicoId) : [...prev, servicoId],
    )
  }

  async function handleConfirmar() {
    if (servicoIds.length === 0) {
      setErro('Escolha pelo menos um serviço.')
      return
    }
    setSalvando(true)
    setErro(null)
    try {
      await criarOuAtualizarHorario(dataISO, hora, barbeiroId, clienteId, servicoIds)
      setOpen(false)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível salvar. Tente de novo.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus size={16} aria-hidden="true" />
        Novo horário
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Novo horário">
        {!podeSalvar ? (
          <EmptyState
            title="Cadastro incompleto"
            description="Cadastre pelo menos um barbeiro, um cliente e um serviço antes de criar um horário."
          />
        ) : (
          <div className="flex flex-col gap-4">
            <Select label="Barbeiro" value={barbeiroId} onChange={(e) => setBarbeiroId(e.target.value)}>
              {barbeiros.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nome}
                </option>
              ))}
            </Select>

            <Select label="Horário" value={hora} onChange={(e) => setHora(e.target.value)}>
              {TIME_SLOTS.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </Select>

            <Select label="Cliente" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </Select>

            <div>
              <p className="mb-2 text-sm text-text-primary">Serviços</p>
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
              <p className="mt-1.5 text-xs text-text-secondary">
                Se a duração somada passar de um slot, os horários seguintes ficam reservados também.
              </p>
            </div>

            {erro && <p className="text-xs text-status-red">{erro}</p>}

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleConfirmar} disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar horário'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
