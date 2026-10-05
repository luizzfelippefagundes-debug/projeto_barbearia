'use client'

import { useTransition, useState } from 'react'
import { AlertTriangle, CheckCircle, CreditCard, Loader2 } from 'lucide-react'
import type { Cliente } from '../../types'
import { Button, Card } from '../../components/ui'
import {
  verificarECorrigirRecorrenciaCartao,
  type ResultadoVerificacaoRecorrencia,
} from '../../actions/assinaturas.actions'

export function RecorrenciaCartaoSection({ clientes }: { clientes: Cliente[] }) {
  const [pending, startTransition] = useTransition()
  const [resultado, setResultado] = useState<ResultadoVerificacaoRecorrencia | null>(null)

  function nomeCliente(clienteId: string) {
    return clientes.find((c) => c.id === clienteId)?.nome ?? clienteId
  }

  function executar() {
    startTransition(async () => {
      const r = await verificarECorrigirRecorrenciaCartao()
      setResultado(r)
    })
  }

  const semProblema = resultado && resultado.corrigidas.length === 0 && resultado.semToken.length === 0 && resultado.erros === 0

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

          {resultado.corrigidas.length > 0 && (
            <div>
              <div className="mb-1.5 flex items-center gap-1.5 text-status-green">
                <CheckCircle size={14} aria-hidden="true" />
                <p className="text-xs font-semibold">
                  {resultado.corrigidas.length} corrigida{resultado.corrigidas.length !== 1 ? 's' : ''} automaticamente
                </p>
              </div>
              <div className="flex flex-col gap-1">
                {resultado.corrigidas.map(({ assinaturaId, clienteId }) => (
                  <p key={assinaturaId} className="text-xs text-text-secondary">
                    • {nomeCliente(clienteId)} — cartão associado, cobrança automática ativada
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
                Esses clientes têm assinatura sem cartão associado no Asaas. Se pagam por{' '}
                <strong>Pix</strong>, isso é normal — precisam pagar manualmente todo mês. Se
                pagaram com <strong>cartão</strong> antes do problema ser corrigido, peça que
                entrem no app e paguem novamente para associar o cartão automaticamente.
              </p>
              <div className="flex flex-col gap-1">
                {resultado.semToken.map(({ assinaturaId, clienteId }) => (
                  <p key={assinaturaId} className="text-xs font-medium text-text-primary">
                    • {nomeCliente(clienteId)}
                  </p>
                ))}
              </div>
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
