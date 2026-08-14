import { CheckCircle2 } from 'lucide-react'
import { Button, Card } from '../../../components/ui'
import { useAppData } from '../../../state/useAppData'
import { formatBRL } from '../../../lib/format'
import { HOJE_ISO } from '../../../lib/dateUtils'
import { CLIENTE_ATUAL_ID } from '../../../lib/constants'
import { SubscriptionSavingsBlock } from './SubscriptionSavingsBlock'

interface StepConfirmarProps {
  servicoId: string
  barbeiroId: string
  hora: string
  confirmado: boolean
  onConfirmar: () => void
}

export function StepConfirmar({ servicoId, barbeiroId, hora, confirmado, onConfirmar }: StepConfirmarProps) {
  const { state, dispatch } = useAppData()
  const servico = state.servicos.find((s) => s.id === servicoId)
  const barbeiro = state.barbeiros.find((b) => b.id === barbeiroId)

  function handleConfirmar() {
    dispatch({
      type: 'NOVO_HORARIO',
      data: HOJE_ISO,
      hora,
      barbeiroId,
      clienteId: CLIENTE_ATUAL_ID,
      servicoId,
    })
    onConfirmar()
  }

  if (confirmado) {
    return (
      <Card className="flex flex-col items-center gap-3 p-8 text-center">
        <CheckCircle2 size={40} className="text-status-green" aria-hidden="true" />
        <h2 className="text-lg text-text-primary">Agendamento confirmado</h2>
        <p className="text-sm text-text-secondary">
          {servico?.nome} com {barbeiro?.nome} às {hora}.
        </p>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg text-text-primary">Confirmar agendamento</h2>
      <Card className="flex flex-col gap-2 p-4">
        <Linha label="Serviço" valor={servico?.nome ?? ''} />
        <Linha label="Barbeiro" valor={barbeiro?.nome ?? ''} />
        <Linha label="Horário" valor={`Hoje, ${hora}`} />
        <div className="divider-thin" />
        <Linha label="Valor" valor={formatBRL(servico?.precoAvulso ?? 0)} destaque />
      </Card>

      <SubscriptionSavingsBlock />

      <Button onClick={handleConfirmar}>Confirmar agendamento</Button>
    </div>
  )
}

function Linha({ label, valor, destaque }: { label: string; valor: string; destaque?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className={destaque ? 'mono-value text-brass' : 'text-sm text-text-primary'}>{valor}</span>
    </div>
  )
}
