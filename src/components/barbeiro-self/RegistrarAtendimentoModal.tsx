'use client'

import { useRef, useState, useTransition } from 'react'
import { ClipboardCheck, ImagePlus } from 'lucide-react'
import type { Barbeiro, FormaPagamento } from '../../types'
import { Button, Modal, Textarea } from '../../components/ui'
import { registrarMeuAtendimento } from '../../actions/barbeiroSelf.actions'
import { CaixaPicker } from '../agenda/CaixaPicker'
import { FormaPagamentoPicker } from '../agenda/FormaPagamentoPicker'

interface RegistrarAtendimentoModalProps {
  agendamentoId: string
  clienteId: string
  clienteNome: string
  servicoNomes: string[]
  /** Só pede forma de pagamento/caixa quando tem parte avulsa (fora do
   * plano) — corte 100% coberto pelo plano já foi pago na mensalidade. */
  ehAvulso: boolean
  barbeiros: Barbeiro[]
}

export function RegistrarAtendimentoModal({
  agendamentoId,
  clienteId,
  clienteNome,
  servicoNomes,
  ehAvulso,
  barbeiros,
}: RegistrarAtendimentoModalProps) {
  const [open, setOpen] = useState(false)
  const [fotoPreview, setFotoPreview] = useState<string | undefined>(undefined)
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('pix')
  const [caixaDestinoBarbeiroId, setCaixaDestinoBarbeiroId] = useState(barbeiros[0]?.id ?? '')
  const [pending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  function handleFotoSelecionada(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return
    setFotoPreview(URL.createObjectURL(arquivo))
  }

  async function handleSubmit(formData: FormData) {
    formData.set('agendamentoId', agendamentoId)
    formData.set('clienteId', clienteId)
    if (ehAvulso) {
      formData.set('formaPagamento', formaPagamento)
      formData.set('caixaDestinoBarbeiroId', caixaDestinoBarbeiroId)
    }
    startTransition(async () => {
      await registrarMeuAtendimento(formData)
      setOpen(false)
      setFotoPreview(undefined)
      formRef.current?.reset()
    })
  }

  return (
    <>
      <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
        <ClipboardCheck size={14} aria-hidden="true" />
        Registrar atendimento
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title={`Atendimento — ${clienteNome}`}>
        <form ref={formRef} action={handleSubmit} className="flex flex-col gap-4">
          <p className="text-sm text-text-secondary">{servicoNomes.join(' + ')}</p>

          {ehAvulso && (
            <>
              <FormaPagamentoPicker value={formaPagamento} onChange={setFormaPagamento} />
              <CaixaPicker barbeiros={barbeiros} value={caixaDestinoBarbeiroId} onChange={setCaixaDestinoBarbeiroId} />
            </>
          )}

          <Textarea name="nota" rows={3} placeholder="Observação rápida sobre o corte..." />

          <div className="flex items-center gap-3">
            <label className="flex cursor-pointer items-center gap-1.5 text-xs text-text-secondary hover:text-accent">
              <ImagePlus size={16} aria-hidden="true" />
              {fotoPreview ? 'Foto selecionada' : 'Adicionar foto'}
              <input
                name="foto"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleFotoSelecionada}
              />
            </label>
            {fotoPreview && (
              <img
                src={fotoPreview}
                alt="Prévia do corte"
                className="h-8 w-8 rounded-full border border-border object-cover"
              />
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Salvando...' : 'Salvar atendimento'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
