'use client'

import { useState, useTransition } from 'react'
import { UserX } from 'lucide-react'
import { ConfirmDialog, IconButton } from '../../components/ui'
import { marcarMeuNaoCompareceu } from '../../actions/barbeiroSelf.actions'

export function MeuNaoCompareceuButton({ agendamentoId, clienteNome }: { agendamentoId: string; clienteNome: string }) {
  const [pending, startTransition] = useTransition()
  const [confirmar, setConfirmar] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  function handleConfirmar() {
    setErro(null)
    startTransition(async () => {
      try {
        await marcarMeuNaoCompareceu(agendamentoId)
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'Não foi possível marcar.')
      }
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <IconButton
        icon={<UserX size={14} aria-hidden="true" />}
        label="Marcar como não compareceu"
        disabled={pending}
        onClick={() => setConfirmar(true)}
      />
      {erro && <p className="max-w-40 text-right text-xs text-status-red">{erro}</p>}

      <ConfirmDialog
        open={confirmar}
        onClose={() => setConfirmar(false)}
        onConfirm={handleConfirmar}
        title="Não compareceu"
        description={`Marcar que "${clienteNome}" não apareceu nesse horário? Isso libera pra registrar outro atendimento aqui — não conta como corte nem comissão.`}
        confirmLabel="Marcar"
      />
    </div>
  )
}
