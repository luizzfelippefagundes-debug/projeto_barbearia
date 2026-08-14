import { Camera } from 'lucide-react'
import type { HaircutRecord } from '../../types'
import { formatDataCurta } from '../../lib/format'

export function ClienteHaircutGallery({ historico }: { historico: HaircutRecord[] }) {
  const comFoto = historico.filter((h) => h.fotoUrl)

  if (comFoto.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded border border-dashed border-border px-3 py-4 text-xs text-text-secondary">
        <Camera size={16} aria-hidden="true" />
        Nenhuma foto de corte registrada ainda.
      </div>
    )
  }

  return (
    <div className="flex gap-2 overflow-x-auto">
      {comFoto.map((h) => (
        <figure key={h.id} className="w-20 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- fotos vêm do Vercel Blob, domínio dinâmico */}
          <img
            src={h.fotoUrl}
            alt={`Corte de ${formatDataCurta(h.data)}`}
            className="h-20 w-20 rounded border border-border object-cover"
          />
          <figcaption className="mt-1 text-center text-[10px] text-text-secondary">
            {formatDataCurta(h.data)}
          </figcaption>
        </figure>
      ))}
    </div>
  )
}
