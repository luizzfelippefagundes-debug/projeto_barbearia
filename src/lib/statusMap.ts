export interface StatusVisual {
  label: string
  text: string
  bg: string
  border: string
}

const NEUTRAL: StatusVisual = {
  label: 'Livre',
  text: 'text-text-secondary',
  bg: 'bg-surface-raised',
  border: 'border-border',
}

const BLOQUEADO: StatusVisual = {
  label: 'Ocupado',
  text: 'text-text-secondary',
  bg: 'bg-surface-raised',
  border: 'border-border',
}

const GREEN: Omit<StatusVisual, 'label'> = {
  text: 'text-status-green',
  bg: 'bg-status-green-muted',
  border: 'border-status-green',
}

const AMBER: Omit<StatusVisual, 'label'> = {
  text: 'text-status-amber',
  bg: 'bg-status-amber-muted',
  border: 'border-status-amber',
}

const RED: Omit<StatusVisual, 'label'> = {
  text: 'text-status-red',
  bg: 'bg-status-red-muted',
  border: 'border-status-red',
}

export const STATUS_VISUAL_MAP: Record<string, StatusVisual> = {
  confirmado: { label: 'Confirmado', ...GREEN },
  em_dia: { label: 'Em dia', ...GREEN },
  transferido: { label: 'Transferido', ...GREEN },
  aguardando: { label: 'Aguardando', ...AMBER },
  pendente: { label: 'Pendente', ...AMBER },
  atrasado: { label: 'Atrasado', ...RED },
  cancelado: { label: 'Cancelado', ...RED },
  livre: NEUTRAL,
  bloqueado: BLOQUEADO,
}

export function getStatusVisual(status: string): StatusVisual {
  return STATUS_VISUAL_MAP[status] ?? NEUTRAL
}
