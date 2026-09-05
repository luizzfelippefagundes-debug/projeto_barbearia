import { Clock } from 'lucide-react'
import type { Barbeiro, PayoutBarbeiro } from '../../types'
import { Card, StatusPill } from '../../components/ui'
import { BarbeiroAvatarUpload } from './BarbeiroAvatarUpload'
import { PayoutStatusPill } from './PayoutStatusPill'
import { MarcarRepasseButton } from './MarcarRepasseButton'
import { ApagarBarbeiroButton } from './ApagarBarbeiroButton'
import { EditarBarbeiroButton } from './EditarBarbeiroButton'
import { HorarioTrabalhoButton } from './HorarioTrabalhoButton'
import { ToggleAtivoBarbeiroButton } from './ToggleAtivoBarbeiroButton'
import { formatBRL } from '../../lib/format'

interface BarbeiroCardProps {
  barbeiro: Barbeiro
  payout: PayoutBarbeiro | undefined
  cortes: number
  valorAReceber: number
  mesReferencia: string
}

export function BarbeiroCard({ barbeiro, payout, cortes, valorAReceber, mesReferencia }: BarbeiroCardProps) {
  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <BarbeiroAvatarUpload barbeiroId={barbeiro.id} nome={barbeiro.nome} avatarUrl={barbeiro.avatarUrl} />
          <div>
            <h3 className="text-base text-text-primary">{barbeiro.nome}</h3>
            <p className="text-xs text-text-secondary">{cortes} cortes este mês</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <EditarBarbeiroButton barbeiroId={barbeiro.id} nomeAtual={barbeiro.nome} telefoneAtual={barbeiro.telefone} />
          <HorarioTrabalhoButton
            barbeiroId={barbeiro.id}
            diasTrabalhoAtual={barbeiro.diasTrabalho}
            horaInicioAtual={barbeiro.horaInicio}
            horaFimAtual={barbeiro.horaFim}
          />
          <ToggleAtivoBarbeiroButton barbeiroId={barbeiro.id} ativo={barbeiro.ativo} />
          <ApagarBarbeiroButton barbeiroId={barbeiro.id} nome={barbeiro.nome} />
        </div>
      </div>

      {barbeiro.convitePendente && (
        <StatusPill
          status="aguardando"
          label={
            <span className="flex items-center gap-1">
              <Clock size={12} aria-hidden="true" /> Aguardando primeiro login
            </span>
          }
        />
      )}

      {barbeiro.papel === 'dono' ? (
        <p className="text-xs text-text-secondary">Dono não recebe comissão — a receita já é dele.</p>
      ) : (
        <>
          <p className="text-xs text-text-secondary">Comissão: 50% avulso · 45% plano</p>

          <div className="divider-thin" />

          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xs text-text-secondary">Valor a receber</p>
              <p className="mono-value text-xl text-text-primary">{formatBRL(valorAReceber)}</p>
            </div>
            <PayoutStatusPill payout={payout} />
            <MarcarRepasseButton
              barbeiroId={barbeiro.id}
              mesReferencia={mesReferencia}
              valorAReceber={valorAReceber}
              payout={payout}
            />
          </div>
        </>
      )}
    </Card>
  )
}
