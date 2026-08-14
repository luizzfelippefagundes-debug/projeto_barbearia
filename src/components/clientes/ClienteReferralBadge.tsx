import { UserPlus } from 'lucide-react'

export function ClienteReferralBadge({ nomeReferenciador }: { nomeReferenciador?: string }) {
  if (!nomeReferenciador) return null
  return (
    <div className="flex items-center gap-1.5 text-xs text-brass">
      <UserPlus size={14} aria-hidden="true" />
      Indicado por {nomeReferenciador}
    </div>
  )
}
