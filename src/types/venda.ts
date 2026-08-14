export interface Venda {
  id: string
  produtoId: string
  barbeiroId: string
  clienteId?: string
  quantidade: number
  data: string
  valorTotal: number
}
