import type { Produto } from '../../types'
import { Card } from '../../components/ui'
import { ProductRow } from './ProductRow'

export function ProductList({ produtos }: { produtos: Produto[] }) {
  return (
    <Card>
      {produtos.map((produto) => (
        <ProductRow key={produto.id} produto={produto} />
      ))}
    </Card>
  )
}
