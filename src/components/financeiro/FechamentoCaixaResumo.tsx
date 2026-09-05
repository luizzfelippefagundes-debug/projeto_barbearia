'use client'

import { useState, useTransition } from 'react'
import { Lock, LockOpen } from 'lucide-react'
import { Button, Card, SectionHeading } from '../../components/ui'
import { fecharCaixaDoDia, reabrirCaixaDoDia } from '../../actions/caixa.actions'
import { formatBRL, formatHoraCurta } from '../../lib/format'
import { formatDateDisplay } from '../../lib/dateUtils'
import { cn } from '../../lib/cn'

interface Fechamento {
  avulso: number
  produtos: number
  assinatura: number
  total: number
}

interface FechamentoCaixaResumoProps {
  dataISO: string
  inicioSemana: string
  fimSemana: string
  dia: Fechamento
  semana: Fechamento
  mes: Fechamento
  fechado: boolean
  fechadoEm?: string
  fechadoPorNome?: string
}

type Periodo = 'dia' | 'semana' | 'mes'

const LABELS: Record<Periodo, string> = { dia: 'Dia', semana: 'Semana', mes: 'Mês' }

export function FechamentoCaixaResumo({
  dataISO,
  inicioSemana,
  fimSemana,
  dia,
  semana,
  mes,
  fechado,
  fechadoEm,
  fechadoPorNome,
}: FechamentoCaixaResumoProps) {
  const [periodo, setPeriodo] = useState<Periodo>('dia')
  const [pending, startTransition] = useTransition()

  const fechamento = periodo === 'dia' ? dia : periodo === 'semana' ? semana : mes

  const subtitulo =
    periodo === 'dia'
      ? formatDateDisplay(dataISO)
      : periodo === 'semana'
        ? `${formatDateDisplay(inicioSemana)} a ${formatDateDisplay(fimSemana)}`
        : 'Mês atual'

  return (
    <div>
      <SectionHeading
        action={
          periodo === 'dia' &&
          (fechado ? (
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
            <Button size="sm" disabled={pending} onClick={() => startTransition(() => fecharCaixaDoDia(dataISO))}>
              <Lock size={14} aria-hidden="true" />
              {pending ? 'Fechando...' : 'Fechar caixa do dia'}
            </Button>
          ))
        }
      >
        Fechamento de caixa
      </SectionHeading>

      <div className="mb-3 flex items-center gap-2">
        {(['dia', 'semana', 'mes'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriodo(p)}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
              periodo === p
                ? 'bg-accent text-white'
                : 'bg-surface-raised text-text-secondary hover:text-text-primary',
            )}
          >
            {LABELS[p]}
          </button>
        ))}
      </div>

      <p className="mb-2 text-xs text-text-secondary">{subtitulo}</p>

      {periodo === 'dia' && fechado && (
        <p className="mb-3 flex items-center gap-1.5 text-xs text-status-green">
          <Lock size={12} aria-hidden="true" />
          Fechado {fechadoEm ? `às ${formatHoraCurta(fechadoEm)}` : ''}
          {fechadoPorNome ? ` por ${fechadoPorNome}` : ''}
        </p>
      )}

      <Card className="divide-y divide-border p-0">
        <Linha label="Avulso" valor={fechamento.avulso} />
        <Linha label="Assinatura" valor={fechamento.assinatura} />
        <Linha label="Produtos" valor={fechamento.produtos} />
        <div className="flex items-center justify-between px-4 py-3">
          <span className="font-heading text-sm font-bold text-text-primary">Total</span>
          <span className="mono-value text-lg text-accent">{formatBRL(fechamento.total)}</span>
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
