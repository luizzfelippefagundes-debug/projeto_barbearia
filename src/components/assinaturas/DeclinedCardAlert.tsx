'use client'

import { useTransition } from 'react'
import { AlertTriangle, Check } from 'lucide-react'
import type { Assinatura, Cliente } from '../../types'
import { Button, Card } from '../../components/ui'
import { reenviarCobranca } from '../../actions/assinaturas.actions'

export function DeclinedCardAlert({
  assinaturas,
  clientes,
}: {
  assinaturas: Assinatura[]
  clientes: Cliente[]
}) {
  const [pending, startTransition] = useTransition()
  const recusados = assinaturas.filter((a) => a.cartaoRecusado && a.status !== 'cancelado')

  if (recusados.length === 0) return null

  return (
    <Card className="border-status-red/30 bg-status-red-muted p-4">
      <div className="mb-3 flex items-center gap-2 text-status-red">
        <AlertTriangle size={18} aria-hidden="true" />
        <p className="font-heading text-sm font-bold">
          {recusados.length} {recusados.length === 1 ? 'cartão recusado' : 'cartões recusados'}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {recusados.map((assinatura) => {
          const cliente = clientes.find((c) => c.id === assinatura.clienteId)
          return (
            <div key={assinatura.id} className="flex items-center justify-between gap-3">
              <span className="text-sm text-text-primary">{cliente?.nome}</span>
              {assinatura.ultimoReenvioEm ? (
                <span className="flex items-center gap-1.5 text-xs text-status-green">
                  <Check size={14} aria-hidden="true" /> Cobrança reenviada
                </span>
              ) : (
                <Button
                  size="sm"
                  variant="danger"
                  disabled={pending}
                  onClick={() => startTransition(() => reenviarCobranca(assinatura.id))}
                >
                  Reenviar cobrança
                </Button>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
