'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Sparkles } from 'lucide-react'
import type { PlanoAssinatura } from '../../types'
import { Button, Card, Input, Modal } from '../../components/ui'
import { assinarPlano, trocarPlano } from '../../actions/assinar.actions'
import { formatBRL } from '../../lib/format'

export function PlanoCard({
  plano,
  cpfAtual,
  isAtual = false,
  temAssinaturaAtiva = false,
}: {
  plano: PlanoAssinatura
  cpfAtual?: string
  isAtual?: boolean
  temAssinaturaAtiva?: boolean
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [cpf, setCpf] = useState(cpfAtual ?? '')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const modoTroca = temAssinaturaAtiva && !isAtual

  async function handleConfirmar() {
    setSalvando(true)
    setErro(null)
    try {
      const resultado = modoTroca
        ? await trocarPlano(plano.id, cpf)
        : await assinarPlano(plano.id, cpf)
      if ('error' in resultado) {
        setErro(resultado.error)
        setSalvando(false)
        return
      }
      router.push(`/cliente/assinar/${resultado.assinaturaId}/pagar`)
    } catch {
      setErro('Não foi possível assinar. Tente de novo.')
      setSalvando(false)
    }
  }

  const descricaoServicos =
    plano.servicosInclusos.length === 0
      ? 'Consulte os benefícios'
      : plano.servicosInclusos
          .map((s) => (s.limiteMensal != null ? `${s.nome} (${s.limiteMensal}x/mês)` : s.nome))
          .join(', ')

  return (
    <>
      <Card className={`flex items-center justify-between gap-3 p-4 ${isAtual ? 'border-accent/40' : ''}`}>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-text-primary">{plano.nome}</p>
            {isAtual && (
              <span className="flex items-center gap-1 text-xs text-accent">
                <CheckCircle2 size={12} aria-hidden="true" />
                Plano atual
              </span>
            )}
          </div>
          <p className="text-xs text-text-secondary">{descricaoServicos}</p>
          <p className="mono-value mt-1 text-lg text-accent">{formatBRL(plano.valorMensal)}/mês</p>
        </div>
        {!isAtual && (
          <Button size="sm" variant={modoTroca ? 'secondary' : 'primary'} onClick={() => setOpen(true)}>
            {modoTroca ? 'Trocar' : 'Assinar'}
          </Button>
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={modoTroca ? `Trocar para ${plano.nome}` : `Assinar ${plano.nome}`}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 rounded-xl bg-accent-muted p-3 text-xs text-accent">
            <Sparkles size={14} aria-hidden="true" />
            {modoTroca
              ? `Seu plano atual será cancelado e você pagará ${formatBRL(plano.valorMensal)} para ativar o novo.`
              : `Primeira cobrança de ${formatBRL(plano.valorMensal)} via Pix ou cartão de crédito.`}
          </div>
          <Input
            label="Seu CPF"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            placeholder="000.000.000-00"
            inputMode="numeric"
          />
          {erro && <p className="text-xs text-status-red">{erro}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmar} disabled={salvando}>
              {salvando ? 'Aguarde...' : modoTroca ? 'Confirmar troca' : 'Confirmar e pagar'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
