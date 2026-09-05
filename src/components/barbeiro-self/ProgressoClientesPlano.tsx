import { CheckCircle2 } from 'lucide-react'
import type { ProgressoClientePlano } from '../../lib/derive'
import { Card, EmptyState, SectionHeading } from '../../components/ui'
import { formatBRL } from '../../lib/format'

export function ProgressoClientesPlano({ clientes }: { clientes: ProgressoClientePlano[] }) {
  return (
    <div>
      <SectionHeading>Meus clientes de plano este mês</SectionHeading>
      <p className="-mt-2 mb-3 text-xs text-text-secondary">
        Cada corte de plano já rende comissão pra você desde a primeira visita do cliente no mês.
      </p>
      {clientes.length === 0 ? (
        <EmptyState title="Nenhum cliente de plano ainda" description="Assim que você atender um assinante, ele aparece aqui." />
      ) : (
        <Card className="divide-y divide-border p-0">
          {clientes.map((c) => (
            <div key={c.clienteId} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm text-text-primary">{c.clienteNome}</p>
                <p className="text-xs text-text-secondary">
                  {c.cortesNoMes} {c.cortesNoMes === 1 ? 'corte' : 'cortes'} este mês
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-status-green">
                <CheckCircle2 size={16} aria-hidden="true" />
                <span className="mono-value text-sm">{formatBRL(c.comissaoGanha)}</span>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
