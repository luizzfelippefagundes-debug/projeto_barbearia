'use client'

import { useState, useTransition } from 'react'
import { Lock, Unlock } from 'lucide-react'
import { IconButton } from '../../components/ui'
import { bloquearHorario, desbloquearHorario } from '../../actions/agenda.actions'

export function BloquearHorarioButton({
  data,
  hora,
  barbeiroId,
  bloqueado,
}: {
  data: string
  hora: string
  barbeiroId: string
  bloqueado: boolean
}) {
  const [pending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)

  function handleClick() {
    setErro(null)
    startTransition(async () => {
      try {
        const resultado = bloqueado
          ? await desbloquearHorario(data, hora, barbeiroId)
          : await bloquearHorario(data, hora, barbeiroId)
        if (resultado.error) setErro(resultado.error)
      } catch {
        setErro('Não foi possível atualizar.')
      }
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <IconButton
        icon={
          bloqueado ? <Unlock size={14} aria-hidden="true" /> : <Lock size={14} aria-hidden="true" />
        }
        label={bloqueado ? 'Desbloquear horário' : 'Bloquear horário'}
        disabled={pending}
        onClick={handleClick}
      />
      {erro && <p className="max-w-40 text-right text-xs text-status-red">{erro}</p>}
    </div>
  )
}
