import { Sparkles } from 'lucide-react'

export function PreviewResultCard({ fotoUrl }: { fotoUrl: string }) {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded border border-accent">
      {/* eslint-disable-next-line @next/next/no-img-element -- prévia usa a foto local enviada pelo cliente (blob URL) */}
      <img
        src={fotoUrl}
        alt="Prévia do corte gerada"
        className="h-full w-full object-cover"
        style={{ filter: 'saturate(1.15) contrast(1.05) brightness(1.03)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-accent/40 via-transparent to-transparent" />
      <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-white shadow-sm">
        <Sparkles size={12} aria-hidden="true" />
        Gerado com IA
      </span>
      <span className="absolute right-2 bottom-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] text-text-secondary shadow-sm">
        exemplo
      </span>
    </div>
  )
}
