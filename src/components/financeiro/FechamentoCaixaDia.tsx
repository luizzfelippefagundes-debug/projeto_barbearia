'use client'

import { useTransition } from 'react'
import { Lock, LockOpen } from 'lucide-react'
import { Button, Card, SectionHeading } from '../../components/ui'
import { fecharCaixaDoDia, reabrirCaixaDoDia } from '../../actions/caixa.actions'
import { formatBRL, formatHoraCurta } from '../../lib/format'
import { formatDateDisplay } from '../../lib/dateUtils'

interface FechamentoCaixaDiaProps {
  dataISO: string
  avulso: number
  produtos: number
  assinatura: number
  total: number
  fechado: boolean
  fechadoEm?: string
  fechadoPorNome?: string
}

export function FechamentoCaixaDia({
  dataISO,
  avulso,
  produtos,
  assinatura,
  total,
  fechado,
  fechadoEm,
  fechadoPorNome,
}: FechamentoCaixaDiaProps) {
  const [pending, startTransition] = useTransition()

  return (
    <div>
      <SectionHeading
        action={
          fechado ? (
            <Button
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={() => startTransition(() => reabrirCaixaDoDia(dataISO))}
            >
              <LockOpen size={14} aria-hidden="true" />
              Reabrir
            </Button>
          ) : (
            <Button
              size="sm"
              disabled={pending}
              onClick={() => startTransition(() => fecharCaixaDoDia(dataISO))}
            >
              <Lock size={14} aria-hidden="true" />
              {pending ? 'Fechando...' : 'Fechar caixa do dia'}
            </Button>
          )
        }
      >
        Caixa de hoje — {formatDateDisplay(dataISO)}
      </SectionHeading>

      {fechado && (
        <p className="mb-3 flex items-center gap-1.5 text-xs text-status-green">
          <Lock size={12} aria-hidden="true" />
          Fechado {fechadoEm ? `às ${formatHoraCurta(fechadoEm)}` : ''}
          {fechadoPorNome ? ` por ${fechadoPorNome}` : ''}
        </p>
      )}

      <Card className="divide-y divide-border p-0">
        <Linha label="Avulso" valor={avulso} />
        <Linha label="Assinatura" valor={assinatura} />
        <Linha label="Produtos" valor={produtos} />
        <div className="flex items-center justify-between px-4 py-3">
          <span className="font-heading text-sm font-bold text-text-primary">Total do dia</span>
          <span className="mono-value text-lg text-accent">{formatBRL(total)}</span>
        </div>
      </Card>
    </div>
  )
}

function Linha({ label, valor }: { label: string; valor: number }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="mono-value text-sm text-text-primary">{formatBRL(valor)}</span>
    </div>
  )
}
