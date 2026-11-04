export interface Servico {
  id: string
  nome: string
  duracaoMin: number
  precoAvulso: number
  /** Null = disponível/com esse preço pra qualquer barbeiro. Preenchido =
   * exceção de preço exclusiva de um barbeiro (ver schema). */
  barbeiroId: string | null
  ativo: boolean
}
