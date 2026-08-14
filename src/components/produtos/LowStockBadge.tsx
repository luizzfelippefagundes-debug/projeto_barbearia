import { AlertTriangle } from 'lucide-react'
import { StatusPill } from '../../components/ui'

export function LowStockBadge({ estoque, estoqueMinimo }: { estoque: number; estoqueMinimo: number }) {
  if (estoque > estoqueMinimo) return null
  return (
    <StatusPill
      status="atrasado"
      label={
        <span className="flex items-center gap-1">
          <AlertTriangle size={12} aria-hidden="true" /> Estoque baixo
        </span>
      }
    />
  )
}
