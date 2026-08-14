import { Scissors, Sparkles } from 'lucide-react'

export function PreviewResultCard() {
  return (
    <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded border border-accent bg-accent-muted text-accent">
      <Scissors size={28} aria-hidden="true" />
      <span className="flex items-center gap-1.5 text-sm">
        <Sparkles size={14} aria-hidden="true" />
        Prévia gerada (exemplo)
      </span>
    </div>
  )
}
