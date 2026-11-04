'use client'

import { useState, useTransition } from 'react'
import { Eye, EyeOff, RefreshCw, Trash2 } from 'lucide-react'
import { ConfirmDialog, IconButton } from '../../components/ui'
import { apagarPlano, sincronizarPrecoPlanoNoAsaas, toggleAtivoPlano } from '../../actions/assinaturas.actions'
import { PlanoFormModal } from './PlanoFormModal'
import type { PlanoAssinatura, Servico } from '../../types'

export function PlanoRowActions({ plano, servicos }: { plano: PlanoAssinatura; servicos: Servico[] }) {
  const [pending, startTransition] = useTransition()
  const [confirmApagar, setConfirmApagar] = useState(false)
  const [confirmSync, setConfirmSync] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)

  function handleApagar() {
    setErro(null)
    startTransition(async () => {
      try {
        const resultado = await apagarPlano(plano.id)
        if (resultado.error) setErro(resultado.error)
      } catch {
        setErro('Não foi possível apagar.')
      }
    })
  }

  function handleSync() {
    setErro(null)
    setAviso(null)
    startTransition(async () => {
      try {
        const r = await sincronizarPrecoPlanoNoAsaas(plano.id)
        if (!('plano' in r)) {
          setErro(r.error ?? 'Não foi possível sincronizar.')
          return
        }
        const partes = [`${r.atualizadas} atualizada(s)`]
        if (r.jaAtualizadas) partes.push(`${r.jaAtualizadas} já estava(m)`)
        if (r.erros) partes.push(`${r.erros} com erro`)
        setAviso(`Preço sincronizado: ${partes.join(', ')}.`)
      } catch {
        setErro('Não foi possível sincronizar.')
      }
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <PlanoFormModal plano={plano} servicos={servicos} />
        <IconButton
          icon={<RefreshCw size={14} aria-hidden="true" />}
          label="Sincronizar preço no Asaas"
          disabled={pending}
          onClick={() => setConfirmSync(true)}
        />
        <IconButton
          icon={plano.ativo ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
          label={plano.ativo ? 'Desativar plano' : 'Reativar plano'}
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await toggleAtivoPlano(plano.id, !plano.ativo)
            })
          }
        />
        <IconButton
          icon={<Trash2 size={14} aria-hidden="true" />}
          label="Apagar plano"
          disabled={pending}
          onClick={() => setConfirmApagar(true)}
        />
      </div>
      {erro && <p className="max-w-48 text-right text-xs text-status-red">{erro}</p>}
      {aviso && <p className="max-w-56 text-right text-xs text-status-green">{aviso}</p>}

      <ConfirmDialog
        open={confirmSync}
        onClose={() => setConfirmSync(false)}
        onConfirm={handleSync}
        title="Sincronizar preço no Asaas?"
        description={`Aplica o preço atual de "${plano.nome}" (R$ ${Number(plano.valorMensal).toFixed(2).replace('.', ',')}) na cobrança recorrente de todos os assinantes ativos. O Asaas só cobra o valor novo a partir da próxima fatura — ninguém é cobrado retroativo.`}
        confirmLabel="Sincronizar"
      />

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
