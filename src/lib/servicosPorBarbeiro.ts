import type { Servico } from '../types'

/** Filtra a lista de serviços pros que valem pra um barbeiro específico —
 * usado em toda tela onde o cliente/admin escolhe serviço DEPOIS de já
 * saber quem vai atender (agendamento do cliente, novo horário manual,
 * atendimento avulso).
 *
 * Um serviço com `barbeiroId` preenchido só aparece quando é exatamente
 * esse barbeiro. Um serviço padrão (`barbeiroId: null`) aparece sempre,
 * EXCETO quando existe uma versão exclusiva do MESMO nome pra esse
 * barbeiro — senão "Cabelo" apareceria duas vezes na lista (preço padrão e
 * preço exclusivo) e dava pra marcar as duas achando que eram serviços
 * diferentes, dobrando a duração/preço do agendamento sem querer. */
export function servicosParaBarbeiro(servicos: Servico[], barbeiroId: string | undefined): Servico[] {
  return servicos.filter((s) => {
    if (s.barbeiroId) return s.barbeiroId === barbeiroId
    const temExclusivoDoBarbeiro = servicos.some((x) => x.nome === s.nome && x.barbeiroId === barbeiroId)
    return !temExclusivoDoBarbeiro
  })
}
