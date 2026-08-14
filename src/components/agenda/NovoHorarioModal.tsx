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
  const [servicoId, setServicoId] = useState(servicos[0]?.id ?? '')
  const [salvando, setSalvando] = useState(false)

  const podeSalvar = barbeiros.length > 0 && clientes.length > 0 && servicos.length > 0

  async function handleConfirmar() {
    setSalvando(true)
    try {
      await criarOuAtualizarHorario(dataISO, hora, barbeiroId, clienteId, servicoId)
      setOpen(false)
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

            <Select label="Serviço" value={servicoId} onChange={(e) => setServicoId(e.target.value)}>
              {servicos.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome}
                </option>
              ))}
            </Select>

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
