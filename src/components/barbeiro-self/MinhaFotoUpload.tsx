'use client'

import { useRef, useState, useTransition } from 'react'
import { Camera } from 'lucide-react'
import { Avatar, FotoCropModal } from '../../components/ui'
import { atualizarMinhaFoto } from '../../actions/barbeiroSelf.actions'

export function MinhaFotoUpload({ nome, avatarUrl }: { nome: string; avatarUrl?: string }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [arquivoParaRecortar, setArquivoParaRecortar] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined)
  const [pending, startTransition] = useTransition()

  function handleEscolher(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return
    setArquivoParaRecortar(arquivo)
  }

  function fecharModal() {
    setArquivoParaRecortar(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  function handleConfirmarRecorte(arquivoRecortado: File) {
    setPreviewUrl(URL.createObjectURL(arquivoRecortado))
    fecharModal()
    startTransition(async () => {
      await atualizarMinhaFoto(arquivoRecortado)
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative shrink-0"
        aria-label="Trocar minha foto"
      >
        <Avatar nome={nome} src={previewUrl ?? avatarUrl} size="lg" className={pending ? 'opacity-60' : ''} />
        <span className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface text-text-secondary">
          <Camera size={12} aria-hidden="true" />
        </span>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleEscolher} />
      </button>

      <FotoCropModal
        open={arquivoParaRecortar !== null}
        arquivo={arquivoParaRecortar}
        onCancelar={fecharModal}
        onConfirmar={handleConfirmarRecorte}
      />
    </>
  )
}
