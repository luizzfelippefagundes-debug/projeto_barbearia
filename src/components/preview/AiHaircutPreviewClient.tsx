'use client'

import { useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import type { Servico } from '../../types'
import { Button, Select } from '../../components/ui'
import { PhotoUploadDropzone } from './PhotoUploadDropzone'
import { PreviewResultCard } from './PreviewResultCard'

export function AiHaircutPreviewClient({ servicos }: { servicos: Servico[] }) {
  const [foto, setFoto] = useState<string | undefined>(undefined)
  const [servicoId, setServicoId] = useState(servicos[0]?.id ?? '')
  const [gerando, setGerando] = useState(false)
  const [resultadoGerado, setResultadoGerado] = useState(false)

  function handleGerar() {
    setGerando(true)
    setResultadoGerado(false)
    setTimeout(() => {
      setGerando(false)
      setResultadoGerado(true)
    }, 1400)
  }

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
        {resultadoGerado && foto ? (
          <PreviewResultCard fotoUrl={foto} />
        ) : (
          <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded border border-dashed border-border text-center text-xs text-text-secondary">
            {gerando ? (
              <>
                <Loader2 size={22} className="animate-spin text-accent" aria-hidden="true" />
                <span>Gerando prévia...</span>
              </>
            ) : (
              <>
                <Sparkles size={20} aria-hidden="true" />
                <span>O resultado aparece aqui</span>
              </>
            )}
          </div>
        )}
      </div>

      {servicos.length > 0 && (
        <Select label="Corte desejado" value={servicoId} onChange={(e) => setServicoId(e.target.value)}>
          {servicos.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nome}
            </option>
          ))}
        </Select>
      )}

      <Button disabled={!foto || gerando} onClick={handleGerar}>
        {gerando ? 'Gerando...' : 'Gerar preview'}
      </Button>
    </div>
  )
}
