'use client'

import { useState, useTransition } from 'react'
import { ClipboardCheck } from 'lucide-react'
import type { Barbeiro, FormaPagamento } from '../../types'
import { Button, Modal, Textarea } from '../../components/ui'
import { registrarAtendimentoAdmin } from '../../actions/agenda.actions'
import { CaixaPicker } from './CaixaPicker'
import { FormaPagamentoPicker } from './FormaPagamentoPicker'

export function RegistrarAtendimentoAdminModal({
  agendamentoId,
  clienteId,
  clienteNome,
  servicoNomes,
  ehAvulso,
  barbeiros,
  barbeiroDoAgendamentoId,
}: {
  agendamentoId: string
  clienteId: string
  clienteNome: string
  servicoNomes: string[]
  /** Só pede forma de pagamento/caixa quando tem parte avulsa (fora do
   * plano) — corte 100% coberto pelo plano já foi pago na mensalidade. */
  ehAvulso: boolean
  barbeiros: Barbeiro[]
  barbeiroDoAgendamentoId: string
}) {
  const [open, setOpen] = useState(false)
  const [nota, setNota] = useState('')
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('pix')
  const [caixaDestinoBarbeiroId, setCaixaDestinoBarbeiroId] = useState(barbeiroDoAgendamentoId)
  const [pending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)

  function fechar() {
    setOpen(false)
    setNota('')
    setErro(null)
  }

  function handleSalvar() {
    setErro(null)
    startTransition(async () => {
      try {
        await registrarAtendimentoAdmin(
          agendamentoId,
          clienteId,
          nota,
          ehAvulso ? formaPagamento : undefined,
          ehAvulso ? caixaDestinoBarbeiroId : undefined,
        )
        fechar()
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'Não foi possível registrar.')
      }
    })
  }

  return (
    <>
      <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
        <ClipboardCheck size={14} aria-hidden="true" />
        Registrar atendimento
      </Button>

      <Modal open={open} onClose={fechar} title={`Atendimento — ${clienteNome}`}>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-text-secondary">{servicoNomes.join(' + ')}</p>

          {ehAvulso && (
            <>
              <FormaPagamentoPicker value={formaPagamento} onChange={setFormaPagamento} />
              <CaixaPicker barbeiros={barbeiros} value={caixaDestinoBarbeiroId} onChange={setCaixaDestinoBarbeiroId} />
            </>
          )}

          <Textarea
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            rows={3}
            placeholder="Observação rápida sobre o corte..."
          />

          {erro && <p className="text-xs text-status-red">{erro}</p>}

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={fechar}>
              Cancelar
            </Button>
            <Button onClick={handleSalvar} disabled={pending}>
              {pending ? 'Salvando...' : 'Salvar atendimento'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
