import { SectionHeading } from '../../components/ui'
import { useAppData } from '../../state/useAppData'
import { ProductList } from './ProductList'
import { BestSellerRanking } from './BestSellerRanking'

export function ProdutosScreen() {
  const { state } = useAppData()

  return (
    <div className="flex flex-col gap-8">
      <div>
        <SectionHeading>Estoque de produtos</SectionHeading>
        <ProductList produtos={state.produtos} />
      </div>
      <BestSellerRanking />
    </div>
  )
}
