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
  const [erro, setErro] = useState<string | null>(null)

  function handleCancelar() {
    setErro(null)
    startTransition(async () => {
      try {
        const resultado = await cancelarMinhaAssinatura(assinatura.id)
        if (resultado.error) setErro(resultado.error)
      } catch {
        setErro('Não foi possível cancelar a assinatura.')
      }
    })
  }

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

      {erro && <p className="mt-2 text-xs text-status-red">{erro}</p>}

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleCancelar}
        title="Cancelar assinatura"
        description={`Tem certeza que quer cancelar o ${plano.nome}? Você perde os benefícios a partir da próxima cobrança.`}
        confirmLabel="Sim, cancelar"
      />
    </Card>
  )
}
