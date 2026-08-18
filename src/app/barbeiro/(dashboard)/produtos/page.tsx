import { Card, EmptyState, SectionHeading } from '../../../../components/ui'
import { VenderProdutoButton } from '../../../../components/barbeiro-self/VenderProdutoButton'
import { getProdutosAtivos } from '../../../../db/queries/produtos'
import { formatBRL } from '../../../../lib/format'

export default async function VenderProdutoPage() {
  const produtos = await getProdutosAtivos()

  return (
    <div>
      <SectionHeading>Vender produto</SectionHeading>
      {produtos.length === 0 ? (
        <EmptyState title="Nenhum produto cadastrado" description="Peça pro dono cadastrar os produtos." />
      ) : (
        <Card>
          {produtos.map((produto) => (
            <div
              key={produto.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-b-0"
            >
              <div>
                <p className="text-sm text-text-primary">{produto.nome}</p>
                <p className="text-xs text-text-secondary">
                  {formatBRL(produto.precoVenda)} · {produto.estoque} em estoque
                </p>
              </div>
              <VenderProdutoButton produto={produto} />
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
