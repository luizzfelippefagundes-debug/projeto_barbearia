'use client'

import { useTransition } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { IconButton } from '../../components/ui'
import { toggleAtivoBarbeiro } from '../../actions/barbeiros.actions'

export function ToggleAtivoBarbeiroButton({ barbeiroId, ativo }: { barbeiroId: string; ativo: boolean }) {
  const [pending, startTransition] = useTransition()

  return (
    <IconButton
      icon={ativo ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
      label={ativo ? 'Desativar barbeiro' : 'Reativar barbeiro'}
      disabled={pending}
      onClick={() => startTransition(() => toggleAtivoBarbeiro(barbeiroId, !ativo))}
    />
  )
}
