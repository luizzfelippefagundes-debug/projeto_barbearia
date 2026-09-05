export type StatusPagamento = 'em_dia' | 'atrasado' | 'aguardando' | 'cancelado'
export type StatusAgendamento = 'confirmado' | 'atendido' | 'livre' | 'aguardando' | 'bloqueado' | 'nao_compareceu'
export type StatusPayout = 'transferido' | 'pendente'
export type CanalIndicacao =
  | 'indicacao_amigo'
  | 'instagram'
  | 'google'
  | 'passou_na_rua'
  | 'outro'
export type ThumbUpDown = 'up' | 'down' | null
export type PapelBarbeiro = 'dono' | 'barbeiro'
export type FormaPagamento = 'pix' | 'cartao' | 'dinheiro'
