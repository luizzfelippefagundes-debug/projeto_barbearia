import type { Servico } from '../../types'
import { Card } from '../../components/ui'
import { formatBRL } from '../../lib/format'
import { getPrecoServicoParaCliente } from '../../lib/derive'

export function StepServico({
  servicos,
  assinanteAtivo,
  onSelect,
}: {
  servicos: Servico[]
  assinanteAtivo: boolean
  onSelect: (servicoId: string) => void
}) {
  return (
    <div>
      <h2 className="mb-4 text-lg text-text-primary">Escolha o serviço</h2>
      <div className="flex flex-col gap-2">
        {servicos.map((servico) => {
          const { valor, incluido } = getPrecoServicoParaCliente(servico, assinanteAtivo)
          const comDesconto = assinanteAtivo && !incluido && valor < servico.precoAvulso
          return (
            <button key={servico.id} type="button" onClick={() => onSelect(servico.id)} className="text-left">
              <Card className="flex items-center justify-between px-4 py-3 hover:border-brass">
                <div>
                  <p className="text-sm text-text-primary">{servico.nome}</p>
                  <p className="text-xs text-text-secondary">{servico.duracaoMin} min</p>
                </div>
                <div className="text-right">
                  {incluido ? (
                    <span className="rounded-full bg-status-green-muted px-2 py-0.5 text-xs font-medium text-status-green">
                      Incluso no plano
                    </span>
                  ) : (
                    <>
                      {comDesconto && (
                        <span className="mono-value mr-1.5 text-xs text-text-secondary line-through">
                          {formatBRL(servico.precoAvulso)}
                        </span>
                      )}
                      <span className="mono-value text-sm text-brass">{formatBRL(valor)}</span>
                    </>
                  )}
                </div>
              </Card>
            </button>
          )
        })}
      </div>
    </div>
  )
}
