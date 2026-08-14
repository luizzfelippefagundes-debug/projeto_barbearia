import { UserPlus } from 'lucide-react'
import { useAppData } from '../../state/useAppData'

export function ClienteReferralBadge({ indicadoPor }: { indicadoPor?: string }) {
  const { state } = useAppData()
  if (!indicadoPor) return null

  const referenciador = state.clientes.find((c) => c.id === indicadoPor)
  if (!referenciador) return null

  return (
    <div className="flex items-center gap-1.5 text-xs text-brass">
      <UserPlus size={14} aria-hidden="true" />
      Indicado por {referenciador.nome}
    </div>
  )
}
