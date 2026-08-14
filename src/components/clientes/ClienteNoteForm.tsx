'use client'

import { useRef, useState, useTransition } from 'react'
import { ImagePlus } from 'lucide-react'
import type { Barbeiro, Servico } from '../../types'
import { Button, Select, Textarea } from '../../components/ui'
import { registrarAtendimento } from '../../actions/clientes.actions'

export function ClienteNoteForm({
  clienteId,
  barbeiros,
  servicos,
}: {
  clienteId: string
  barbeiros: Barbeiro[]
  servicos: Servico[]
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const [fotoPreview, setFotoPreview] = useState<string | undefined>(undefined)
  const [pending, startTransition] = useTransition()

  if (barbeiros.length === 0 || servicos.length === 0) {
    return (
      <p className="rounded border border-dashed border-border p-3 text-xs text-text-secondary">
        Cadastre um barbeiro e um serviço para registrar atendimentos.
      </p>
    )
  }

  function handleFotoSelecionada(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return
    setFotoPreview(URL.createObjectURL(arquivo))
  }

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await registrarAtendimento(clienteId, formData)
      formRef.current?.reset()
      setFotoPreview(undefined)
    })
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="flex flex-col gap-3 rounded border border-border bg-surface-raised p-3"
    >
      <p className="text-xs text-text-secondary">Registrar atendimento</p>
      <div className="grid grid-cols-2 gap-2">
        <Select name="barbeiroId" defaultValue={barbeiros[0]?.id}>
          {barbeiros.map((b) => (
            <option key={b.id} value={b.id}>
              {b.nome}
            </option>
          ))}
        </Select>
        <Select name="servicoId" defaultValue={servicos[0]?.id}>
          {servicos.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nome}
            </option>
          ))}
        </Select>
      </div>

      <Textarea name="nota" rows={2} placeholder="Observação rápida sobre o corte..." />

      <div className="flex items-center justify-between gap-2">
        <label className="flex cursor-pointer items-center gap-1.5 text-xs text-text-secondary hover:text-brass">
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
          <img src={fotoPreview} alt="Prévia do corte" className="h-8 w-8 rounded border border-border object-cover" />
        )}
      </div>

      <Button size="sm" type="submit" disabled={pending}>
        {pending ? 'Salvando...' : 'Salvar atendimento'}
      </Button>
    </form>
  )
}
