import type { Produto } from '../../types'
import { formatBRL } from '../../lib/format'
import { LowStockBadge } from './LowStockBadge'
import { RegistrarVendaButton } from './RegistrarVendaButton'

export function ProductRow({ produto }: { produto: Produto }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-b-0">
      <div className="min-w-[10rem]">
        <p className="text-sm text-text-primary">{produto.nome}</p>
        <p className="text-xs text-text-secondary">{produto.categoria}</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="mono-value text-sm text-text-primary">{formatBRL(produto.precoVenda)}</p>
        </div>
        <div className="text-right">
          <p className="mono-value text-sm text-text-primary">{produto.estoque} un.</p>
          <LowStockBadge estoque={produto.estoque} estoqueMinimo={produto.estoqueMinimo} />
        </div>
        <RegistrarVendaButton produto={produto} />
      </div>
    </div>
  )
}
