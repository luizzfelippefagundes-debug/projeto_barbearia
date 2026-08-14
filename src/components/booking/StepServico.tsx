import type { Servico } from '../../types'
import { Card } from '../../components/ui'
import { formatBRL } from '../../lib/format'

export function StepServico({
  servicos,
  onSelect,
}: {
  servicos: Servico[]
  onSelect: (servicoId: string) => void
}) {
  return (
    <div>
      <h2 className="mb-4 text-lg text-text-primary">Escolha o serviço</h2>
      <div className="flex flex-col gap-2">
        {servicos.map((servico) => (
          <button key={servico.id} type="button" onClick={() => onSelect(servico.id)} className="text-left">
            <Card className="flex items-center justify-between px-4 py-3 hover:border-brass">
              <div>
                <p className="text-sm text-text-primary">{servico.nome}</p>
                <p className="text-xs text-text-secondary">{servico.duracaoMin} min</p>
              </div>
              <span className="mono-value text-sm text-brass">{formatBRL(servico.precoAvulso)}</span>
            </Card>
          </button>
        ))}
      </div>
    </div>
  )
}
