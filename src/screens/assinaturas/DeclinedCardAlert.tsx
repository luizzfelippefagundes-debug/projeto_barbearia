import { AlertTriangle, Check } from 'lucide-react'
import { Button, Card } from '../../components/ui'
import { useAppData } from '../../state/useAppData'

export function DeclinedCardAlert() {
  const { state, dispatch } = useAppData()
  const recusados = state.assinaturas.filter((a) => a.cartaoRecusado && a.status !== 'cancelado')

  if (recusados.length === 0) return null

  return (
    <Card className="border-status-red bg-status-red-muted p-4">
      <div className="mb-3 flex items-center gap-2 text-status-red">
        <AlertTriangle size={18} aria-hidden="true" />
        <p className="font-heading text-sm tracking-wide uppercase">
          {recusados.length} {recusados.length === 1 ? 'cartão recusado' : 'cartões recusados'}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {recusados.map((assinatura) => {
          const cliente = state.clientes.find((c) => c.id === assinatura.clienteId)
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
                  onClick={() => dispatch({ type: 'REENVIAR_COBRANCA', assinaturaId: assinatura.id })}
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
