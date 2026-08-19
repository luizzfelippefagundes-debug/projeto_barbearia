'use client'

import { useRef, useState, useTransition } from 'react'
import { Camera } from 'lucide-react'
import { Avatar } from '../../components/ui'
import { atualizarFotoBarbeiro } from '../../actions/barbeiros.actions'

export function BarbeiroAvatarUpload({
  barbeiroId,
  nome,
  avatarUrl,
}: {
  barbeiroId: string
  nome: string
  avatarUrl?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined)
  const [pending, startTransition] = useTransition()

  function handleEscolher(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return
    setPreviewUrl(URL.createObjectURL(arquivo))
    startTransition(async () => {
      await atualizarFotoBarbeiro(barbeiroId, arquivo)
    })
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="relative shrink-0"
      aria-label="Trocar foto do barbeiro"
    >
      <Avatar nome={nome} src={previewUrl ?? avatarUrl} size="lg" className={pending ? 'opacity-60' : ''} />
      <span className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface text-text-secondary">
        <Camera size={12} aria-hidden="true" />
      </span>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleEscolher} />
    </button>
  )
}
