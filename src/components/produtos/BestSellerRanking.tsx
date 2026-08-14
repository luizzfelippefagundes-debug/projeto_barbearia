import type { Barbeiro, Produto, Venda } from '../../types'
import { Card, EmptyState, SectionHeading } from '../../components/ui'
import { getBestSellerPorBarbeiro } from '../../lib/derive'

export function BestSellerRanking({
  barbeiros,
  vendas,
  produtos,
}: {
  barbeiros: Barbeiro[]
  vendas: Venda[]
  produtos: Produto[]
}) {
  return (
    <div>
      <SectionHeading>Produto mais vendido por barbeiro</SectionHeading>
      {barbeiros.length === 0 ? (
        <EmptyState title="Sem barbeiros" description="Cadastre barbeiros para ver o ranking." />
      ) : (
        <Card>
          {barbeiros.map((barbeiro) => {
            const melhor = getBestSellerPorBarbeiro(vendas, produtos, barbeiro.id)
            return (
              <div
                key={barbeiro.id}
                className="flex items-center justify-between border-b border-border px-4 py-3 last:border-b-0"
              >
                <span className="text-sm text-text-primary">{barbeiro.nome}</span>
                {melhor ? (
                  <span className="text-sm text-text-secondary">
                    {melhor.produto.nome}{' '}
                    <span className="mono-value text-brass">×{melhor.quantidade}</span>
                  </span>
                ) : (
                  <span className="text-sm text-text-secondary">Sem vendas registradas</span>
                )}
              </div>
            )
          })}
        </Card>
      )}
    </div>
  )
}
