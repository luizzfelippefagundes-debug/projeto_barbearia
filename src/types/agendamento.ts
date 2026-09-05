import type { FormaPagamento, StatusAgendamento } from './common'

export interface Agendamento {
  id: string
  data: string
  hora: string
  clienteId?: string
  barbeiroId: string
  /** Um ou mais serviços pedidos nesse horário (ex: corte + barba). */
  servicoIds: string[]
  /** Se definido, essa linha existe só pra travar um horário seguinte que
   * um agendamento anterior ocupou por causa da duração — não tem serviço
   * próprio, é uma continuação do agendamento com esse id. */
  continuacaoDeId?: string
  status: StatusAgendamento
  /** Só preenchido quando o atendimento tem parte avulsa (fora do plano) —
   * organização/relatório, não afeta comissão nem fechamento de caixa. */
  formaPagamento?: FormaPagamento
  /** Qual barbeiro/dono ficou com o dinheiro na hora. */
  caixaDestinoBarbeiroId?: string
}
