'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import type { PlanoAssinatura } from '../../types'
import { Button, Card, Input, Modal } from '../../components/ui'
import { assinarPlano } from '../../actions/assinar.actions'
import { formatBRL } from '../../lib/format'

export function PlanoCard({ plano, cpfAtual }: { plano: PlanoAssinatura; cpfAtual?: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [cpf, setCpf] = useState(cpfAtual ?? '')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function handleConfirmar() {
    setSalvando(true)
    setErro(null)
    try {
      const { assinaturaId } = await assinarPlano(plano.id, cpf)
      router.push(`/cliente/assinar/${assinaturaId}/pagar`)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível assinar. Tente de novo.')
      setSalvando(false)
    }
  }

  return (
    <>
      <Card className="flex items-center justify-between gap-3 p-4">
        <div>
          <p className="text-sm font-semibold text-text-primary">{plano.nome}</p>
          <p className="text-xs text-text-secondary">
            {plano.cortesInclusos === 'ilimitado' ? 'Cortes ilimitados' : `${plano.cortesInclusos} corte(s)/mês`}
          </p>
          <p className="mono-value mt-1 text-lg text-accent">{formatBRL(plano.valorMensal)}/mês</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          Assinar
        </Button>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={`Assinar ${plano.nome}`}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 rounded-xl bg-accent-muted p-3 text-xs text-accent">
            <Sparkles size={14} aria-hidden="true" />
            Primeira cobrança via PIX, {formatBRL(plano.valorMensal)}.
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
              {salvando ? 'Gerando PIX...' : 'Confirmar e pagar'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
