'use client'

import { useState, useTransition } from 'react'
import { Eye, EyeOff, Trash2 } from 'lucide-react'
import { ConfirmDialog, IconButton } from '../../components/ui'
import { apagarPlano, toggleAtivoPlano } from '../../actions/assinaturas.actions'
import { PlanoFormModal } from './PlanoFormModal'
import type { PlanoAssinatura, Servico } from '../../types'

export function PlanoRowActions({ plano, servicos }: { plano: PlanoAssinatura; servicos: Servico[] }) {
  const [pending, startTransition] = useTransition()
  const [confirmApagar, setConfirmApagar] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  function handleApagar() {
    setErro(null)
    startTransition(async () => {
      try {
        await apagarPlano(plano.id)
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'Não foi possível apagar.')
      }
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <PlanoFormModal plano={plano} servicos={servicos} />
        <IconButton
          icon={plano.ativo ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
          label={plano.ativo ? 'Desativar plano' : 'Reativar plano'}
          disabled={pending}
          onClick={() => startTransition(() => toggleAtivoPlano(plano.id, !plano.ativo))}
        />
        <IconButton
          icon={<Trash2 size={14} aria-hidden="true" />}
          label="Apagar plano"
          disabled={pending}
          onClick={() => setConfirmApagar(true)}
        />
      </div>
      {erro && <p className="max-w-48 text-right text-xs text-status-red">{erro}</p>}

      <ConfirmDialog
        open={confirmApagar}
        onClose={() => setConfirmApagar(false)}
        onConfirm={handleApagar}
        title="Apagar plano"
        description={`Tem certeza que quer apagar "${plano.nome}"? Essa ação não pode ser desfeita.`}
        confirmLabel="Apagar"
      />
    </div>
  )
}
