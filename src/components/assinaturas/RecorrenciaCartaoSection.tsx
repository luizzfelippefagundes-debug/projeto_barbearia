'use client'

import { useTransition, useState } from 'react'
import { AlertTriangle, CheckCircle, CreditCard, Loader2 } from 'lucide-react'
import type { Cliente } from '../../types'
import { Button, Card } from '../../components/ui'
import {
  verificarECorrigirRecorrenciaCartao,
  detalharAssinaturasSemToken,
  type ResultadoVerificacaoRecorrencia,
  type DetalheAssinaturaSemToken,
} from '../../actions/assinaturas.actions'

function labelBillingType(b: string) {
  if (b === 'PIX') return 'Pix'
  if (b === 'CREDIT_CARD') return 'Cartão de crédito'
  if (b === 'BOLETO') return 'Boleto'
  if (b === 'UNDEFINED') return 'Não definido'
  return b
}

function labelStatus(s: string) {
  if (s === 'RECEIVED' || s === 'CONFIRMED') return 'Pago'
  if (s === 'PENDING') return 'Pendente'
  if (s === 'OVERDUE') return 'Vencido'
  if (s === 'REFUNDED') return 'Estornado'
  if (s === 'CANCELLED') return 'Cancelado'
  return s
}

export function RecorrenciaCartaoSection({ clientes }: { clientes: Cliente[] }) {
  const [pending, startTransition] = useTransition()
  const [resultado, setResultado] = useState<ResultadoVerificacaoRecorrencia | null>(null)
  const [detalhes, setDetalhes] = useState<DetalheAssinaturaSemToken[] | null>(null)
  const [carregandoDetalhes, setCarregandoDetalhes] = useState(false)

  function nomeCliente(clienteId: string) {
    return clientes.find((c) => c.id === clienteId)?.nome ?? clienteId
  }

  function executar() {
    startTransition(async () => {
      const r = await verificarECorrigirRecorrenciaCartao()
      setResultado(r)
    })
  }

  const semProblema =
    resultado &&
    resultado.semIp.length === 0 &&
    resultado.semToken.length === 0 &&
    resultado.cobradas.length === 0 &&
    resultado.erros === 0

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center gap-2">
        <CreditCard size={18} className="text-accent" aria-hidden="true" />
        <p className="font-heading text-sm font-bold text-text-primary">Recorrência de cartão</p>
      </div>

      <p className="mb-4 text-xs text-text-secondary">
        Verifica assinaturas onde o cartão não está configurado para cobrança automática e tenta
        corrigir automaticamente buscando o token do último pagamento.
      </p>

      {!resultado && (
        <Button size="sm" onClick={executar} disabled={pending}>
          {pending ? (
            <>
              <Loader2 size={14} className="animate-spin" aria-hidden="true" />
              Verificando {resultado === null ? '' : '…'}
            </>
          ) : (
            'Verificar e corrigir'
          )}
        </Button>
      )}

      {resultado && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-text-secondary">
            {resultado.verificadas} assinatura{resultado.verificadas !== 1 ? 's' : ''} ativa{resultado.verificadas !== 1 ? 's' : ''} verificada{resultado.verificadas !== 1 ? 's' : ''}.
          </p>

          {semProblema && (
            <div className="flex items-center gap-2 text-status-green">
              <CheckCircle size={16} aria-hidden="true" />
              <p className="text-sm font-medium">Tudo certo! Todas as assinaturas têm cobrança automática configurada.</p>
            </div>
          )}

          {resultado.vinculadas.length > 0 && (
            <div>
              <div className="mb-1.5 flex items-center gap-1.5 text-status-green">
                <CheckCircle size={14} aria-hidden="true" />
                <p className="text-xs font-semibold">
                  {resultado.vinculadas.length} com cobrança automática no cartão ativada
                </p>
              </div>
              <div className="flex flex-col gap-1">
                {resultado.vinculadas.map(({ assinaturaId, clienteId }) => (
                  <p key={assinaturaId} className="text-xs text-text-secondary">
                    • {nomeCliente(clienteId)}
                  </p>
                ))}
              </div>
            </div>
          )}

          {resultado.cobradas.length > 0 && (
            <div>
              <div className="mb-1.5 flex items-center gap-1.5 text-status-green">
                <CreditCard size={14} aria-hidden="true" />
                <p className="text-xs font-semibold">
                  {resultado.cobradas.length} fatura{resultado.cobradas.length !== 1 ? 's' : ''} vencida{resultado.cobradas.length !== 1 ? 's' : ''} cobrada{resultado.cobradas.length !== 1 ? 's' : ''} no cartão agora
                </p>
              </div>
              <div className="flex flex-col gap-1">
                {resultado.cobradas.map(({ assinaturaId, clienteId }) => (
                  <p key={assinaturaId} className="text-xs text-text-secondary">
                    • {nomeCliente(clienteId)}
                  </p>
                ))}
              </div>
            </div>
          )}

          {resultado.semIp.length > 0 && (
            <div className="rounded-lg border border-status-yellow/30 bg-status-yellow-muted p-3">
              <div className="mb-1.5 flex items-center gap-1.5 text-status-yellow">
                <AlertTriangle size={14} aria-hidden="true" />
                <p className="text-xs font-semibold">
                  {resultado.semIp.length} pagaram com cartão, mas a cobrança automática não pôde ser ativada
                </p>
              </div>
              <p className="mb-2 text-xs text-text-secondary">
                O Asaas exige um dado que só é capturado quando o cliente paga com cartão pelo app.
                Na próxima vez que ele pagar com cartão pelo app, a cobrança automática é ativada sozinha.
              </p>
              <div className="flex flex-col gap-1">
                {resultado.semIp.map(({ assinaturaId, clienteId }) => (
                  <p key={assinaturaId} className="text-xs font-medium text-text-primary">
                    • {nomeCliente(clienteId)}
                  </p>
                ))}
              </div>
            </div>
          )}

          {resultado.semToken.length > 0 && (
            <div className="rounded-lg border border-status-yellow/30 bg-status-yellow-muted p-3">
              <div className="mb-1.5 flex items-center gap-1.5 text-status-yellow">
                <AlertTriangle size={14} aria-hidden="true" />
                <p className="text-xs font-semibold">
                  {resultado.semToken.length} sem cobrança automática — sem token de cartão
                </p>
              </div>
              <p className="mb-2 text-xs text-text-secondary">
                Clique em &quot;Ver detalhes&quot; para ver o método de pagamento de cada um.
              </p>
              {!detalhes && (
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={carregandoDetalhes}
                  onClick={() => {
                    setCarregandoDetalhes(true)
                    detalharAssinaturasSemToken().then((d) => { setDetalhes(d); setCarregandoDetalhes(false) })
                  }}
                >
                  {carregandoDetalhes ? <Loader2 size={12} className="animate-spin" /> : 'Ver detalhes'}
                </Button>
              )}
              {detalhes && (
                <div className="mt-2 flex flex-col gap-2">
                  {detalhes.map((d) => {
                    const p = d.ultimoPagamento
                    const vencido = p?.status === 'OVERDUE'
                    return (
                      <div key={d.assinaturaId} className={`rounded p-2 text-xs ${vencido ? 'bg-status-red/10 border border-status-red/30' : 'bg-bg-secondary'}`}>
                        <p className="font-medium text-text-primary">{d.nomeCliente}</p>
                        {p ? (
                          <p className="text-text-secondary">
                            Último pag.: <strong>{labelBillingType(p.billingType)}</strong> — <strong className={vencido ? 'text-status-red' : ''}>{labelStatus(p.status)}</strong> — venc. {p.dueDate} — R$ {p.value.toFixed(2).replace('.', ',')}
                          </p>
                        ) : (
                          <p className="text-text-secondary">Sem pagamentos no histórico</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {resultado.erros > 0 && (
            <p className="text-xs text-status-red">
              {resultado.erros} erro{resultado.erros !== 1 ? 's' : ''} ao verificar — veja os logs do servidor para detalhes.
            </p>
          )}

          <Button size="sm" variant="secondary" onClick={() => { setResultado(null) }} disabled={pending}>
            Verificar novamente
          </Button>
        </div>
      )}
    </Card>
  )
}
