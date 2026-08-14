import { PiggyBank } from 'lucide-react'
import type { Assinatura, Cliente, PlanoAssinatura, Servico } from '../../types'
import { formatBRL } from '../../lib/format'
import { mesReferenciaDeData } from '../../lib/dateUtils'

export function SubscriptionSavingsBlock({
  cliente,
  assinatura,
  plano,
  servicos,
}: {
  cliente: Cliente
  assinatura?: Assinatura
  plano?: PlanoAssinatura
  servicos: Servico[]
}) {
  if (!assinatura || !plano) return null

  const mesReferencia = mesReferenciaDeData(new Date().toISOString())
  const gastoSeAvulso = cliente.historico
    .filter((h) => h.data.startsWith(mesReferencia))
    .reduce((total, h) => total + (servicos.find((s) => s.id === h.servicoId)?.precoAvulso ?? 0), 0)

  const economia = gastoSeAvulso - plano.valorMensal
  if (economia <= 0) return null

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-status-green/30 bg-status-green-muted p-4">
      <PiggyBank size={24} className="shrink-0 text-status-green" aria-hidden="true" />
      <p className="text-sm text-text-primary">
        Você já economizou{' '}
        <span className="mono-value text-status-green">{formatBRL(economia)}</span> este mês com o{' '}
        {plano.nome}, comparado a pagar avulso.
      </p>
    </div>
  )
}
