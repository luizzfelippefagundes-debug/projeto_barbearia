'use client'

import { useState, useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { ConfirmDialog, IconButton } from '../../components/ui'
import { apagarBarbeiro } from '../../actions/barbeiros.actions'

export function ApagarBarbeiroButton({ barbeiroId, nome }: { barbeiroId: string; nome: string }) {
  const [pending, startTransition] = useTransition()
  const [confirmar, setConfirmar] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  function handleApagar() {
    setErro(null)
    startTransition(async () => {
      try {
        await apagarBarbeiro(barbeiroId)
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'Não foi possível apagar.')
      }
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <IconButton
        icon={<Trash2 size={14} aria-hidden="true" />}
        label="Apagar barbeiro"
        disabled={pending}
        onClick={() => setConfirmar(true)}
      />
      {erro && <p className="max-w-40 text-right text-xs text-status-red">{erro}</p>}

      <ConfirmDialog
        open={confirmar}
        onClose={() => setConfirmar(false)}
        onConfirm={handleApagar}
        title="Apagar barbeiro"
        description={`Tem certeza que quer apagar "${nome}"? Só é possível se ele nunca teve atendimento ou venda registrada. Essa ação não pode ser desfeita.`}
        confirmLabel="Apagar"
      />
    </div>
  )
}
