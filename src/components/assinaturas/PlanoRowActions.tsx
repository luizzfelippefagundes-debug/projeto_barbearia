'use client'

import { useState, useTransition } from 'react'
import { Eye, EyeOff, RefreshCw, Trash2 } from 'lucide-react'
import { ConfirmDialog, IconButton } from '../../components/ui'
import {
  apagarPlano,
  migrarCartaoTravadoParaValorNovo,
  sincronizarPrecoPlanoNoAsaas,
  toggleAtivoPlano,
  type ItemMigracaoCartao,
} from '../../actions/assinaturas.actions'
import { PlanoFormModal } from './PlanoFormModal'
import type { PlanoAssinatura, Servico } from '../../types'

export function PlanoRowActions({ plano, servicos }: { plano: PlanoAssinatura; servicos: Servico[] }) {
  const [pending, startTransition] = useTransition()
  const [confirmApagar, setConfirmApagar] = useState(false)
  const [confirmSync, setConfirmSync] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [travadas, setTravadas] = useState(0)
  const [simulacao, setSimulacao] = useState<ItemMigracaoCartao[] | null>(null)
  const [resultadoMigracao, setResultadoMigracao] = useState<ItemMigracaoCartao[] | null>(null)

  function handleApagar() {
    setErro(null)
    startTransition(async () => {
      try {
        const resultado = await apagarPlano(plano.id)
        if (resultado.error) setErro(resultado.error)
      } catch {
        setErro('Não foi possível apagar.')
      }
    })
  }

  function handleSync() {
    setErro(null)
    setAviso(null)
    startTransition(async () => {
      try {
        const r = await sincronizarPrecoPlanoNoAsaas(plano.id)
        if (!('plano' in r)) {
          setErro(r.error ?? 'Não foi possível sincronizar.')
          return
        }
        const partes = [`${r.atualizadas} assinatura(s) ajustada(s)`]
        if (r.faturasCorrigidas) partes.push(`${r.faturasCorrigidas} fatura(s) pendente(s) corrigida(s)`)
        if (r.jaAtualizadas) partes.push(`${r.jaAtualizadas} já estava(m) certa(s)`)
        if (r.vencidasValorAntigo) partes.push(`${r.vencidasValorAntigo} vencida(s) no valor antigo (não mexidas)`)
        if (r.travadasNoCartao) partes.push(`${r.travadasNoCartao} no cartão travada(s) pelo Asaas no valor antigo`)
        if (r.erros) partes.push(`${r.erros} com erro`)
        setAviso(`Preço sincronizado: ${partes.join(', ')}.`)
        setTravadas(r.travadasNoCartao)
        setSimulacao(null)
        setResultadoMigracao(null)
      } catch {
        setErro('Não foi possível sincronizar.')
      }
    })
  }

  function handleMigrar(executar: boolean) {
    setErro(null)
    startTransition(async () => {
      try {
        const r = await migrarCartaoTravadoParaValorNovo(plano.id, executar)
        if (!('itens' in r)) {
          setErro(r.error ?? 'Não foi possível.')
          return
        }
        if (executar) {
          setResultadoMigracao(r.itens)
          setSimulacao(null)
          setTravadas(0)
        } else {
          setSimulacao(r.itens)
        }
      } catch {
        setErro('Não foi possível.')
      }
    })
  }

  const ROTULO: Record<ItemMigracaoCartao['situacao'], string> = {
    vai_migrar: 'vai mudar',
    migrada: '✓ mudou',
    vence_hoje: 'vence hoje — fica pro mês que vem',
    tem_vencida: 'tem fatura vencida — não mexe',
    erro: 'erro',
  }
  const dataBR = (d: string | null) => (d ? d.split('-').reverse().join('/') : '—')
  const vaiMigrar = simulacao?.filter((i) => i.situacao === 'vai_migrar').length ?? 0

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <PlanoFormModal plano={plano} servicos={servicos} />
        <IconButton
          icon={<RefreshCw size={14} aria-hidden="true" />}
          label="Sincronizar preço no Asaas"
          disabled={pending}
          onClick={() => setConfirmSync(true)}
        />
        <IconButton
          icon={plano.ativo ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
          label={plano.ativo ? 'Desativar plano' : 'Reativar plano'}
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await toggleAtivoPlano(plano.id, !plano.ativo)
            })
          }
        />
        <IconButton
          icon={<Trash2 size={14} aria-hidden="true" />}
          label="Apagar plano"
          disabled={pending}
          onClick={() => setConfirmApagar(true)}
        />
      </div>
      {erro && <p className="max-w-48 text-right text-xs text-status-red">{erro}</p>}
      {aviso && <p className="max-w-56 text-right text-xs text-status-green">{aviso}</p>}

      {travadas > 0 && !simulacao && !resultadoMigracao && (
        <button
          type="button"
          disabled={pending}
          onClick={() => handleMigrar(false)}
          className="max-w-64 text-right text-xs text-accent underline disabled:opacity-50"
        >
          Desligar o automático das travadas e cobrar o valor novo no Renovar (simular primeiro)
        </button>
      )}

      {(simulacao || resultadoMigracao) && (
        <div className="mt-1 w-72 rounded-lg border border-border p-2 text-left text-xs">
          <p className="mb-1 font-medium text-text-primary">
            {resultadoMigracao ? 'Resultado' : `Simulação — ${vaiMigrar} vão mudar`}
          </p>
          <p className="mb-2 text-text-secondary">
            Quem muda deixa de ser cobrado no automático. No vencimento, paga pelo Renovar o valor novo e o
            automático volta.
          </p>
          <ul className="max-h-48 space-y-0.5 overflow-y-auto">
            {(resultadoMigracao ?? simulacao)!.map((i) => (
              <li key={i.nomeCliente + i.proximaCobranca} className="flex justify-between gap-2">
                <span className="truncate text-text-primary">{i.nomeCliente}</span>
                <span className="shrink-0 text-text-secondary">
                  {dataBR(i.proximaCobranca)} · {ROTULO[i.situacao]}
                  {i.detalhe ? ` (${i.detalhe})` : ''}
                </span>
              </li>
            ))}
          </ul>
          {simulacao && vaiMigrar > 0 && (
            <button
              type="button"
              disabled={pending}
              onClick={() => handleMigrar(true)}
              className="mt-2 w-full rounded-md bg-accent px-2 py-1 text-white disabled:opacity-50"
            >
              {pending ? 'Mudando…' : `Confirmar: mudar ${vaiMigrar}`}
            </button>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmSync}
        onClose={() => setConfirmSync(false)}
        onConfirm={handleSync}
        title="Sincronizar preço no Asaas?"
        description={`Aplica o preço atual de "${plano.nome}" (R$ ${Number(plano.valorMensal).toFixed(2).replace('.', ',')}) na cobrança recorrente de todos os assinantes ativos, incluindo a próxima fatura que o Asaas já gerou e ainda não foi paga. Faturas já pagas ou vencidas não mudam — ninguém é cobrado retroativo.`}
        confirmLabel="Sincronizar"
      />

      <ConfirmDialog
        open={confirmApagar}
        onClose={() => setConfirmApagar(false)}
        onConfirm={handleApagar}
        title="Apagar plano"
        description={`Tem certeza que quer apagar "${plano.nome}"? Essa ação não pode ser desfeita.`}
        confirmLabel="Apagar"
      />
    </div>
  )
}
