import { Card, SectionHeading } from '../../components/ui'
import { useAppData } from '../../state/useAppData'
import { getBestSellerPorBarbeiro } from '../../lib/derive'

export function BestSellerRanking() {
  const { state } = useAppData()

  return (
    <div>
      <SectionHeading>Produto mais vendido por barbeiro</SectionHeading>
      <Card>
        {state.barbeiros.map((barbeiro) => {
          const melhor = getBestSellerPorBarbeiro(state.vendas, state.produtos, barbeiro.id)
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
    </div>
  )
}
