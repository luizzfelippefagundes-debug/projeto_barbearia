'use client'

import { useState } from 'react'
import { Clock } from 'lucide-react'
import { Button, IconButton, Modal, Select, WeekdaysPicker } from '../../components/ui'
import { editarHorarioTrabalho } from '../../actions/barbeiros.actions'
import { TIME_SLOTS } from '../../lib/dateUtils'

export function HorarioTrabalhoButton({
  barbeiroId,
  diasTrabalhoAtual,
  horaInicioAtual,
  horaFimAtual,
}: {
  barbeiroId: string
  diasTrabalhoAtual: number[]
  horaInicioAtual: string
  horaFimAtual: string
}) {
  const [open, setOpen] = useState(false)
  const [dias, setDias] = useState(diasTrabalhoAtual)
  const [horaInicio, setHoraInicio] = useState(horaInicioAtual)
  const [horaFim, setHoraFim] = useState(horaFimAtual)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  function fechar() {
    setOpen(false)
    setDias(diasTrabalhoAtual)
    setHoraInicio(horaInicioAtual)
    setHoraFim(horaFimAtual)
    setErro(null)
  }

  async function handleSalvar() {
    setSalvando(true)
    setErro(null)
    try {
      await editarHorarioTrabalho(barbeiroId, dias, horaInicio, horaFim)
      setOpen(false)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível salvar.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <>
      <IconButton icon={<Clock size={14} aria-hidden="true" />} label="Horário de trabalho" onClick={() => setOpen(true)} />

      <Modal open={open} onClose={fechar} title="Horário de trabalho" widthClassName="max-w-sm">
        <div className="flex flex-col gap-4">
          <p className="text-xs text-text-secondary">
            Define o que aparece pro cliente agendar (site e WhatsApp). Pra sair mais cedo num dia específico, use
            "bloquear horário" na agenda em vez de mudar isso aqui.
          </p>
          <WeekdaysPicker value={dias} onChange={setDias} />
          <div className="flex gap-3">
            <Select label="Início" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)}>
              {TIME_SLOTS.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </Select>
            <Select label="Fim" value={horaFim} onChange={(e) => setHoraFim(e.target.value)}>
              {TIME_SLOTS.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </Select>
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
