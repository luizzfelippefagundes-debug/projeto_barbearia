import { useState } from 'react'
import { Repeat } from 'lucide-react'
import { Button, Card, ConfirmDialog, StatusPill } from '../../../components/ui'
import { useAppData } from '../../../state/useAppData'
import { formatBRL, formatDataCurta } from '../../../lib/format'
import { CLIENTE_ATUAL_ID } from '../../../lib/constants'

export function SubscriptionCancelFlow() {
  const { state, dispatch } = useAppData()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const cliente = state.clientes.find((c) => c.id === CLIENTE_ATUAL_ID)
  const assinatura = state.assinaturas.find((a) => a.id === cliente?.assinaturaId)
  const plano = state.planosAssinatura.find((p) => p.id === assinatura?.planoId)

  if (!assinatura || !plano) return null

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
            {formatBRL(plano.valorMensal)}/mês · próxima cobrança {formatDataCurta(assinatura.proximaCobranca)}
          </p>
        </div>
        <StatusPill status={assinatura.status} />
      </div>

      {assinatura.status === 'cancelado' ? (
        <p className="text-xs text-text-secondary">Sua assinatura foi cancelada.</p>
      ) : (
        <Button size="sm" variant="danger" onClick={() => setConfirmOpen(true)}>
          Cancelar assinatura
        </Button>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => dispatch({ type: 'CANCELAR_ASSINATURA', assinaturaId: assinatura.id })}
        title="Cancelar assinatura"
        description={`Tem certeza que quer cancelar o ${plano.nome}? Você perde os benefícios a partir da próxima cobrança.`}
        confirmLabel="Sim, cancelar"
      />
    </Card>
  )
}
