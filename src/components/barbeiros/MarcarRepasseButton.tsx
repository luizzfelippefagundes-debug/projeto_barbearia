'use client'

import { useTransition } from 'react'
import { CheckCheck } from 'lucide-react'
import type { PayoutBarbeiro } from '../../types'
import { Button } from '../../components/ui'
import { marcarRepasseComoPago } from '../../actions/barbeiros.actions'

export function MarcarRepasseButton({
  barbeiroId,
  mesReferencia,
  valorAReceber,
  payout,
}: {
  barbeiroId: string
  mesReferencia: string
  valorAReceber: number
  payout: PayoutBarbeiro | undefined
}) {
  const [pending, startTransition] = useTransition()

  if (payout?.status === 'transferido') return null

  return (
    <Button
      size="sm"
      variant="secondary"
      disabled={pending}
      onClick={() => startTransition(() => marcarRepasseComoPago(barbeiroId, mesReferencia, valorAReceber))}
    >
      <CheckCheck size={14} aria-hidden="true" />
      {pending ? 'Marcando...' : 'Marcar como pago'}
    </Button>
  )
}
