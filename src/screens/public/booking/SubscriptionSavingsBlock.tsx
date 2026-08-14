import { PiggyBank } from 'lucide-react'
import { useAppData } from '../../../state/useAppData'
import { formatBRL } from '../../../lib/format'
import { HOJE_ISO } from '../../../lib/dateUtils'
import { CLIENTE_ATUAL_ID } from '../../../lib/constants'

const MES_REFERENCIA = HOJE_ISO.slice(0, 7)

export function SubscriptionSavingsBlock() {
  const { state } = useAppData()
  const cliente = state.clientes.find((c) => c.id === CLIENTE_ATUAL_ID)
  const assinatura = state.assinaturas.find((a) => a.id === cliente?.assinaturaId)
  const plano = state.planosAssinatura.find((p) => p.id === assinatura?.planoId)

  if (!cliente || !assinatura || !plano) return null

  const gastoSeAvulso = cliente.historico
    .filter((h) => h.data.startsWith(MES_REFERENCIA))
    .reduce((total, h) => total + (state.servicos.find((s) => s.id === h.servicoId)?.precoAvulso ?? 0), 0)

  const economia = gastoSeAvulso - plano.valorMensal

  if (economia <= 0) return null

  return (
    <div className="flex items-center gap-3 rounded border border-status-green bg-status-green-muted p-4">
      <PiggyBank size={24} className="shrink-0 text-status-green" aria-hidden="true" />
      <p className="text-sm text-text-primary">
        Você já economizou{' '}
        <span className="mono-value text-status-green">{formatBRL(economia)}</span> este mês com o{' '}
        {plano.nome}, comparado a pagar avulso.
      </p>
    </div>
  )
}
