import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button, Modal, Select } from '../../components/ui'
import { useAppData } from '../../state/useAppData'
import { TIME_SLOTS } from '../../lib/dateUtils'

export function NovoHorarioModal({ dataISO }: { dataISO: string }) {
  const { state, dispatch } = useAppData()
  const [open, setOpen] = useState(false)
  const [barbeiroId, setBarbeiroId] = useState(state.barbeiros[0]?.id ?? '')
  const [hora, setHora] = useState(TIME_SLOTS[0])
  const [clienteId, setClienteId] = useState(state.clientes[0]?.id ?? '')
  const [servicoId, setServicoId] = useState(state.servicos[0]?.id ?? '')

  function handleConfirmar() {
    dispatch({
      type: 'NOVO_HORARIO',
      data: dataISO,
      hora,
      barbeiroId,
      clienteId,
      servicoId,
    })
    setOpen(false)
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus size={16} aria-hidden="true" />
        Novo horário
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Novo horário">
        <div className="flex flex-col gap-4">
          <Select label="Barbeiro" value={barbeiroId} onChange={(e) => setBarbeiroId(e.target.value)}>
            {state.barbeiros.map((b) => (
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
            {state.clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </Select>

          <Select label="Serviço" value={servicoId} onChange={(e) => setServicoId(e.target.value)}>
            {state.servicos.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome}
              </option>
            ))}
          </Select>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmar}>Salvar horário</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
