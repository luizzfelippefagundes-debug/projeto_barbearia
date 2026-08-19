'use client'

import { useTransition } from 'react'
import { EyeOff } from 'lucide-react'
import type { Servico } from '../../types'
import { IconButton } from '../../components/ui'
import { ServicoFormModal } from './ServicoFormModal'
import { toggleServicoAtivo } from '../../actions/servicos.actions'
import { formatBRL } from '../../lib/format'
import { cn } from '../../lib/cn'

export function ServicoRow({ servico }: { servico: Servico }) {
  const [pending, startTransition] = useTransition()

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-b-0',
        !servico.ativo && 'opacity-50',
      )}
    >
      <div className="min-w-[10rem]">
        <div className="flex items-center gap-2">
          <p className="text-sm text-text-primary">{servico.nome}</p>
          {!servico.ativo && <span className="text-[10px] text-text-secondary">(inativo)</span>}
        </div>
        <p className="text-xs text-text-secondary">{servico.duracaoMin} min</p>
      </div>

      <div className="flex items-center gap-4">
        <p className="mono-value text-sm text-text-primary">{formatBRL(servico.precoAvulso)}</p>
        <ServicoFormModal servico={servico} />
        <IconButton
          icon={<EyeOff size={14} aria-hidden="true" />}
          label={servico.ativo ? 'Desativar serviço' : 'Reativar serviço'}
          disabled={pending}
          onClick={() => startTransition(() => toggleServicoAtivo(servico.id, !servico.ativo))}
        />
      </div>
    </div>
  )
}
