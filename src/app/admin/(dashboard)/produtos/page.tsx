import { Card, EmptyState, SectionHeading } from '../../../../components/ui'
import { ProductRow } from '../../../../components/produtos/ProductRow'
import { NovoProdutoButton } from '../../../../components/produtos/NovoProdutoButton'
import { BestSellerRanking } from '../../../../components/produtos/BestSellerRanking'
import { getProdutosAtivos } from '../../../../db/queries/produtos'
import { getBarbeiros } from '../../../../db/queries/barbeiros'
import { getVendas } from '../../../../db/queries/vendas'

export default async function ProdutosPage() {
  const [produtos, barbeiros, vendas] = await Promise.all([
    getProdutosAtivos(),
    getBarbeiros(),
    getVendas(),
  ])

  return (
    <div className="flex flex-col gap-8">
      <div>
        <SectionHeading action={<NovoProdutoButton />}>Estoque de produtos</SectionHeading>
        {produtos.length === 0 ? (
          <EmptyState
            title="Nenhum produto cadastrado"
            description="Cadastre o primeiro produto para começar a vender."
          />
        ) : (
          <Card>
            {produtos.map((produto) => (
              <ProductRow key={produto.id} produto={produto} barbeiros={barbeiros} />
            ))}
          </Card>
        )}
      </div>
      <BestSellerRanking barbeiros={barbeiros} vendas={vendas} produtos={produtos} />
    </div>
  )
}
