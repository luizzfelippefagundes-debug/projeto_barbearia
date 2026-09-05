'use client'

import { useState, useTransition } from 'react'
import { X } from 'lucide-react'
import { ConfirmDialog, IconButton } from '../../components/ui'
import { cancelarMeuAgendamentoComoBarbeiro } from '../../actions/barbeiroSelf.actions'

export function CancelarMeuAgendamentoButton({ agendamentoId, clienteNome }: { agendamentoId: string; clienteNome: string }) {
  const [pending, startTransition] = useTransition()
  const [confirmar, setConfirmar] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  function handleConfirmar() {
    setErro(null)
    startTransition(async () => {
      try {
        await cancelarMeuAgendamentoComoBarbeiro(agendamentoId)
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'Não foi possível cancelar.')
      }
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <IconButton
        icon={<X size={14} aria-hidden="true" />}
        label="Cancelar agendamento"
        disabled={pending}
        onClick={() => setConfirmar(true)}
      />
      {erro && <p className="max-w-40 text-right text-xs text-status-red">{erro}</p>}

      <ConfirmDialog
        open={confirmar}
        onClose={() => setConfirmar(false)}
        onConfirm={handleConfirmar}
        title="Cancelar agendamento"
        description={`Cancelar o horário de "${clienteNome}"? O horário volta a ficar livre. Essa ação não pode ser desfeita.`}
        confirmLabel="Cancelar horário"
      />
    </div>
  )
}
