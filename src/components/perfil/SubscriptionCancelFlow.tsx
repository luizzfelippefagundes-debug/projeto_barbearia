'use client'

import { useState, useTransition } from 'react'
import { Repeat } from 'lucide-react'
import type { Assinatura, PlanoAssinatura } from '../../types'
import { Button, Card, ConfirmDialog, StatusPill } from '../../components/ui'
import { cancelarMinhaAssinatura } from '../../actions/booking.actions'
import { formatBRL, formatDataCurta } from '../../lib/format'

export function SubscriptionCancelFlow({
  assinatura,
  plano,
}: {
  assinatura: Assinatura
  plano: PlanoAssinatura
}) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center gap-2 text-brass">
        <Repeat size={18} aria-hidden="true" />
        <span className="text-xs tracking-wide uppercase">Minha assinatura</span>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm text-text-primary">{plano.nome}</p>
          <p className="text-xs text-text-secondary">
            {formatBRL(plano.valorMensal)}/mês
            {plano.servicosInclusos.length > 0 && (
              <>
                {' · '}
                {plano.servicosInclusos
                  .map((s) => (s.limiteMensal != null ? `${s.nome} (${s.limiteMensal}x/mês)` : s.nome))
                  .join(', ')}
              </>
            )}
          </p>
          <p className="text-xs text-text-secondary">
            próxima cobrança {formatDataCurta(assinatura.proximaCobranca)}
          </p>
        </div>
        <StatusPill status={assinatura.status} />
      </div>

      {assinatura.status === 'cancelado' ? (
        <p className="text-xs text-text-secondary">Sua assinatura foi cancelada.</p>
      ) : (
        <Button size="sm" variant="danger" disabled={pending} onClick={() => setConfirmOpen(true)}>
          Cancelar assinatura
        </Button>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => startTransition(() => cancelarMinhaAssinatura(assinatura.id))}
        title="Cancelar assinatura"
        description={`Tem certeza que quer cancelar o ${plano.nome}? Você perde os benefícios a partir da próxima cobrança.`}
        confirmLabel="Sim, cancelar"
      />
    </Card>
  )
}
