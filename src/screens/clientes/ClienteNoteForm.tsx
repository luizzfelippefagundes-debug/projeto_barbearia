import { useRef, useState } from 'react'
import { ImagePlus } from 'lucide-react'
import { Button, Select, Textarea } from '../../components/ui'
import { useAppData } from '../../state/useAppData'

export function ClienteNoteForm({ clienteId }: { clienteId: string }) {
  const { state, dispatch } = useAppData()
  const [barbeiroId, setBarbeiroId] = useState(state.barbeiros[0]?.id ?? '')
  const [servicoId, setServicoId] = useState(state.servicos[0]?.id ?? '')
  const [nota, setNota] = useState('')
  const [fotoPreview, setFotoPreview] = useState<string | undefined>(undefined)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFotoSelecionada(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return
    setFotoPreview(URL.createObjectURL(arquivo))
  }

  function handleSalvar() {
    dispatch({
      type: 'ADD_NOTA_CLIENTE',
      clienteId,
      barbeiroId,
      servicoId,
      nota: nota.trim() || undefined,
      fotoUrl: fotoPreview,
    })
    setNota('')
    setFotoPreview(undefined)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="flex flex-col gap-3 rounded border border-border bg-surface-raised p-3">
      <p className="text-xs text-text-secondary">Registrar atendimento</p>
      <div className="grid grid-cols-2 gap-2">
        <Select value={barbeiroId} onChange={(e) => setBarbeiroId(e.target.value)}>
          {state.barbeiros.map((b) => (
            <option key={b.id} value={b.id}>
              {b.nome}
            </option>
          ))}
        </Select>
        <Select value={servicoId} onChange={(e) => setServicoId(e.target.value)}>
          {state.servicos.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nome}
            </option>
          ))}
        </Select>
      </div>

      <Textarea
        rows={2}
        placeholder="Observação rápida sobre o corte..."
        value={nota}
        onChange={(e) => setNota(e.target.value)}
      />

      <div className="flex items-center justify-between gap-2">
        <label className="flex cursor-pointer items-center gap-1.5 text-xs text-text-secondary hover:text-brass">
          <ImagePlus size={16} aria-hidden="true" />
          {fotoPreview ? 'Foto selecionada' : 'Adicionar foto'}
          <input
            ref={fileInputRef}
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

      <Button size="sm" onClick={handleSalvar}>
        Salvar atendimento
      </Button>
    </div>
  )
}
