'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { Repeat } from 'lucide-react'
import type { Assinatura, PlanoAssinatura } from '../../types'
import { Button, Card, ConfirmDialog, StatusPill } from '../../components/ui'
import { cancelarMinhaAssinatura } from '../../actions/booking.actions'
import { formatBRL, formatDataCurta, proximaBillingDate } from '../../lib/format'

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
            próxima cobrança{' '}
            {formatDataCurta(
              assinatura.status === 'em_dia'
                ? proximaBillingDate(assinatura.proximaCobranca)
                : assinatura.proximaCobranca,
            )}
          </p>
        </div>
        <StatusPill status={assinatura.status} />
      </div>

      {assinatura.status === 'cancelado' ? (
        <p className="text-xs text-text-secondary">Sua assinatura foi cancelada.</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {assinatura.status === 'atrasado' && (
              <Link href={`/cliente/assinar/${assinatura.id}/pagar`}>
                <Button size="sm">Renovar agora</Button>
              </Link>
            )}
            <Link href="/cliente/assinar">
              <Button size="sm" variant="ghost">
                {assinatura.status === 'atrasado' ? 'Ver planos' : 'Ver/trocar plano'}
              </Button>
            </Link>
          </div>

          {/* Cancelar o PLANO fica como link discreto, separado dos botões
              principais — antes era um botão vermelho grande do lado de "Ver
              plano" e cliente cancelava o plano achando que desmarcava um
              horário (quem quer desmarcar horário usa "Meus agendamentos"). */}
          <button
            type="button"
            disabled={pending}
            onClick={() => setConfirmOpen(true)}
            className="mt-3 text-xs text-text-secondary underline underline-offset-2 hover:text-status-red disabled:opacity-50"
          >
            Cancelar meu plano mensal
          </button>
        </>
      )}

      {erro && <p className="mt-2 text-xs text-status-red">{erro}</p>}

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleCancelar}
        title="Cancelar seu plano mensal?"
        description={`Atenção: isto cancela sua ASSINATURA (plano ${plano.nome}) — não é para desmarcar um horário. Se você só quer desmarcar um horário, feche aqui e use a seção "Meus agendamentos". Cancelando o plano, você perde os benefícios a partir da próxima cobrança.`}
        confirmLabel="Sim, cancelar meu plano"
      />
    </Card>
  )
}
