'use client'

import { useState, useTransition } from 'react'
import { Lock, Unlock } from 'lucide-react'
import { IconButton } from '../../components/ui'
import { bloquearMeuHorario, desbloquearMeuHorario } from '../../actions/barbeiroSelf.actions'

export function BloquearMeuHorarioButton({
  data,
  hora,
  bloqueado,
}: {
  data: string
  hora: string
  bloqueado: boolean
}) {
  const [pending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)

  function handleClick() {
    setErro(null)
    startTransition(async () => {
      try {
        if (bloqueado) {
          await desbloquearMeuHorario(data, hora)
        } else {
          await bloquearMeuHorario(data, hora)
        }
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'Não foi possível atualizar.')
      }
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <IconButton
        icon={bloqueado ? <Unlock size={14} aria-hidden="true" /> : <Lock size={14} aria-hidden="true" />}
        label={bloqueado ? 'Desbloquear horário' : 'Bloquear horário'}
        disabled={pending}
        onClick={handleClick}
      />
      {erro && <p className="max-w-40 text-right text-xs text-status-red">{erro}</p>}
    </div>
  )
}
