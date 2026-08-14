'use client'

import { useRef } from 'react'
import { Upload } from 'lucide-react'
import { cn } from '../../lib/cn'

export function PhotoUploadDropzone({
  preview,
  onSelect,
}: {
  preview?: string
  onSelect: (fileUrl: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return
    onSelect(URL.createObjectURL(arquivo))
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className={cn(
        'flex aspect-square w-full flex-col items-center justify-center gap-2 overflow-hidden rounded border-2 border-dashed border-border bg-surface text-text-secondary hover:border-brass hover:text-brass',
      )}
    >
      {preview ? (
        <img src={preview} alt="Sua foto enviada" className="h-full w-full object-cover" />
      ) : (
        <>
          <Upload size={28} aria-hidden="true" />
          <span className="text-sm">Envie uma foto sua</span>
        </>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={handleChange} />
    </button>
  )
}
