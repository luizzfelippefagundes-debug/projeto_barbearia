import { useState } from 'react'
import { Button, Select } from '../../../components/ui'
import { useAppData } from '../../../state/useAppData'
import { PhotoUploadDropzone } from './PhotoUploadDropzone'
import { PreviewResultCard } from './PreviewResultCard'

export function AiHaircutPreviewScreen() {
  const { state } = useAppData()
  const [foto, setFoto] = useState<string | undefined>(undefined)
  const [servicoId, setServicoId] = useState(state.servicos[0]?.id ?? '')
  const [resultadoGerado, setResultadoGerado] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg text-text-primary">Preview de corte com IA</h1>
        <p className="text-sm text-text-secondary">Veja como o corte escolhido fica em você antes de agendar.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <PhotoUploadDropzone
          preview={foto}
          onSelect={(url) => {
            setFoto(url)
            setResultadoGerado(false)
          }}
        />
        {resultadoGerado ? (
          <PreviewResultCard />
        ) : (
          <div className="flex aspect-square w-full items-center justify-center rounded border border-dashed border-border text-center text-xs text-text-secondary">
            O resultado aparece aqui
          </div>
        )}
      </div>

      <Select label="Corte desejado" value={servicoId} onChange={(e) => setServicoId(e.target.value)}>
        {state.servicos.map((s) => (
          <option key={s.id} value={s.id}>
            {s.nome}
          </option>
        ))}
      </Select>

      <Button disabled={!foto} onClick={() => setResultadoGerado(true)}>
        Gerar preview
      </Button>
    </div>
  )
}
