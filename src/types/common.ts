export type StatusPagamento = 'em_dia' | 'atrasado' | 'aguardando' | 'cancelado'
export type StatusAgendamento = 'confirmado' | 'livre' | 'aguardando' | 'bloqueado'
export type StatusPayout = 'transferido' | 'pendente'
export type CanalIndicacao =
  | 'indicacao_amigo'
  | 'instagram'
  | 'google'
  | 'passou_na_rua'
  | 'outro'
export type ThumbUpDown = 'up' | 'down' | null
