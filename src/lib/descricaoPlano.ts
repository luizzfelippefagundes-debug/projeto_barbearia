/** "Cabelo, Barba, Barboterapia (4x/mês)" — lista os serviços inclusos num
 * plano, um nome só por serviço. O mesmo serviço pode estar incluso duas
 * vezes (a versão de preço padrão e a de preço exclusivo de um barbeiro,
 * ver servicos.barbeiroId), mas pro cliente/dono é um serviço só. */
export function descricaoServicosDoPlano(
  servicosInclusos: { nome: string; limiteMensal: number | null }[],
): string {
  const rotulos = servicosInclusos.map((s) => (s.limiteMensal != null ? `${s.nome} (${s.limiteMensal}x/mês)` : s.nome))
  return [...new Set(rotulos)].join(', ')
}
